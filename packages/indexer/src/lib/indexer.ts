import { type BaseLogger } from 'pino';
import { type SearchIndex } from '@azure/search-documents';
import { encoding_for_model, type TiktokenModel } from '@dqbd/tiktoken';
import { type AzureClients } from '../plugins/azure.js';
import { type OpenAiService } from '../plugins/openai.js';
import { wait } from './util/index.js';
import { DocumentProcessor } from './document-processor.js';
import { extractText, extractTextFromPdf } from './formats/index.js';
import { MODELS_SUPPORTED_BATCH_SIZE } from './model-limits.js';
import { BlobStorage } from './blob-storage.js';
import { type Section } from './document.js';

export interface IndexFileOptions {
  useVectors?: boolean;
  uploadToStorage?: boolean;
  throwErrors?: boolean;
}

export interface FileInfos {
  filename: string;
  data: Buffer;
  type: string;
  category: string;
}

const INDEXING_BATCH_SIZE = 1000;

export class Indexer {
  private blobStorage: BlobStorage;

  constructor(
    private logger: BaseLogger,
    private azure: AzureClients,
    private openai: OpenAiService,
    private embeddingModelName: string = 'text-embedding-ada-002',
  ) {
    this.blobStorage = new BlobStorage(logger, azure);
  }

  async createSearchIndex(indexName: string, useSemanticRanker = false) {
    this.logger.debug(`Ensuring search index "${indexName}" exists`);

    const searchIndexClient = this.azure.searchIndex;

    const names: string[] = [];
    const indexNames = await searchIndexClient.listIndexes();
    for await (const index of indexNames) {
      names.push(index.name);
    }
    if (names.includes(indexName)) {
      this.logger.debug(`Search index "${indexName}" already exists`);
    } else {
      const index: SearchIndex = {
        name: indexName,
        vectorSearch: {
          algorithms: [
            {
              name: 'vector-search-algorithm',
              kind: 'hnsw',
              parameters: {
                m: 4,
                efSearch: 500,
                metric: 'cosine',
                efConstruction: 400,
              },
            },
          ],
          profiles: [
            {
              name: 'vector-search-profile',
              algorithmConfigurationName: 'vector-search-algorithm',
            },
          ],
        },
        ...(useSemanticRanker
          ? {
              semanticSearch: {
                defaultConfigurationName: 'semantic-search-config',
                configurations: [
                  {
                    name: 'semantic-search-config',
                    prioritizedFields: {
                      contentFields: [
                        {
                          name: 'content',
                        },
                      ],
                    },
                  },
                ],
              },
            }
          : {}),
        fields: [
          {
            name: 'id',
            type: 'Edm.String',
            key: true,
          },
          {
            name: 'content',
            type: 'Edm.String',
            searchable: true,
            analyzerName: 'en.microsoft',
          },
          {
            name: 'embedding',
            type: 'Collection(Edm.Single)',
            hidden: false,
            searchable: true,
            filterable: false,
            sortable: false,
            facetable: false,
            vectorSearchDimensions: 1536,
            vectorSearchProfileName: 'vector-search-profile',
          },
          {
            name: 'category',
            type: 'Edm.String',
            filterable: true,
            facetable: true,
          },
          {
            name: 'sourcepage',
            type: 'Edm.String',
            filterable: true,
            facetable: true,
          },
          {
            name: 'sourcefile',
            type: 'Edm.String',
            filterable: true,
            facetable: true,
          },
        ],
      };
      this.logger.debug(`Creating "${indexName}" search index...`);
      await searchIndexClient.createIndex(index);
    }
  }

  async deleteSearchIndex(indexName: string) {
    this.logger.debug(`Deleting search index "${indexName}"`);
    const searchIndexClient = this.azure.searchIndex;
    await searchIndexClient.deleteIndex(indexName);
  }

  async indexFile(indexName: string, fileInfos: FileInfos, options: IndexFileOptions = {}) {
    const { filename, data, type, category } = fileInfos;
    this.logger.debug(`Indexing file "${filename}" into search index "${indexName}..."`);

    try {
      if (options.uploadToStorage) {
        // TODO: use separate containers for each index?
        await this.blobStorage.upload(filename, data, type);
      }

      const documentProcessor = new DocumentProcessor(this.logger);
      documentProcessor.registerFormatHandler('text/plain', extractText);
      documentProcessor.registerFormatHandler('text/markdown', extractText);
      documentProcessor.registerFormatHandler('application/pdf', extractTextFromPdf);
      const document = await documentProcessor.createDocumentFromFile(filename, data, type, category);
      const sections = document.sections;
      if (options.useVectors) {
        await this.updateEmbeddingsInBatch(sections);
      }

      const searchClient = this.azure.searchIndex.getSearchClient(indexName);

      const batchSize = INDEXING_BATCH_SIZE;
      let batch: Section[] = [];

      for (let index = 0; index < sections.length; index++) {
        batch.push(sections[index]);

        if (batch.length === batchSize || index === sections.length - 1) {
          const { results } = await searchClient.uploadDocuments(batch);
          const succeeded = results.filter((r) => r.succeeded).length;
          const indexed = batch.length;
          this.logger.debug(`Indexed ${indexed} sections, ${succeeded} succeeded`);
          batch = [];
        }
      }
    } catch (_error: unknown) {
      const error = _error as Error;
      if (options.throwErrors) {
        throw error;
      } else {
        this.logger.error(`Error indexing file "${filename}": ${error.message}`);
      }
    }
  }

  async deleteFromIndex(indexName: string, filename?: string) {
    this.logger.debug(`Removing sections from "${filename ?? '<all>'}" from search index "${indexName}"`);
    const searchClient = this.azure.searchIndex.getSearchClient(indexName);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const filter = filename ? `sourcefile eq '${filename}'` : undefined;
      const r = await searchClient.search('', { filter: filter, top: 1000, includeTotalCount: true });
      if (r.count === 0) {
        break;
      }
      const documents: any[] = [];
      for await (const d of r.results) {
        documents.push({ id: (d.document as any).id });
      }

      const { results } = await searchClient.deleteDocuments(documents);
      this.logger.debug(`Removed ${results.length} sections from index`);

      await (filename ? this.blobStorage.delete(filename) : this.blobStorage.deleteAll());

      // It can take a few seconds for search results to reflect changes, so wait a bit
      await wait(2000);
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    // TODO: add retry
    const embeddingsClient = await this.openai.getEmbeddings();
    const result = await embeddingsClient.create({ input: text, model: this.embeddingModelName });
    return result.data[0].embedding;
  }

  async createEmbeddingsInBatch(texts: string[]): Promise<Array<number[]>> {
    // TODO: add retry
    const embeddingsClient = await this.openai.getEmbeddings();
    const result = await embeddingsClient.create({ input: texts, model: this.embeddingModelName });
    return result.data.map((d) => d.embedding);
  }

  async updateEmbeddingsInBatch(sections: Section[]): Promise<Section[]> {
    const batchSize = MODELS_SUPPORTED_BATCH_SIZE[this.embeddingModelName];
    const batchQueue: Section[] = [];
    let tokenCount = 0;

    for (const [index, section] of sections.entries()) {
      tokenCount += getTokenCount(section.content, this.embeddingModelName);
      batchQueue.push(section);

      if (
        tokenCount > batchSize.tokenLimit ||
        batchQueue.length >= batchSize.maxBatchSize ||
        index === sections.length - 1
      ) {
        const embeddings = await this.createEmbeddingsInBatch(batchQueue.map((section) => section.content));
        for (const [index_, section] of batchQueue.entries()) section.embedding = embeddings[index_];
        this.logger.debug(`Batch Completed. Batch size ${batchQueue.length} Token count ${tokenCount}`);

        batchQueue.length = 0;
        tokenCount = 0;
      }
    }

    return sections;
  }
}

export function getTokenCount(input: string, model: string): number {
  const encoder = encoding_for_model(model as TiktokenModel);
  const tokens = encoder.encode(input).length;
  encoder.free();
  return tokens;
}
