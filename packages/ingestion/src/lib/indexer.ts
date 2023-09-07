import { BaseLogger } from 'pino';
import { SearchIndex } from '@azure/search-documents';
import { encoding_for_model, TiktokenModel } from '@dqbd/tiktoken';
import { AzureClients } from '../plugins/azure';
import { OpenAiService } from '../plugins/openai';
import { wait } from './util/index.js';
import { DocumentProcessor, Section } from './document-processor.js';

export interface IndexFileOptions {
  useVectors?: boolean;
}

export interface FileInfos {
  filename: string;
  data: Buffer;
  type: string;
  category: string;
}

export interface ModelLimit {
  tokenLimit: number;
  maxBatchSize: number;
}

export const MODELS_SUPPORTED_BATCH_SIZE: Record<string, ModelLimit> = {
  'text-embedding-ada-002': {
    tokenLimit: 8100,
    maxBatchSize: 16,
  },
};

const INDEXING_BATCH_SIZE = 1000;

export class Indexer {
  constructor(
    private logger: BaseLogger,
    private azure: AzureClients,
    private openai: OpenAiService,
    private embeddingModelName: string = 'text-embedding-ada-002',
  ) {}

  async createSearchIndex(indexName: string) {
    this.logger.debug(`Ensuring search index "${indexName}" exists`);

    const searchIndexClient = this.azure.searchIndex;

    const names: string[] = [];
    const indexNames = await searchIndexClient.listIndexes();
    for await (const index of indexNames) {
      names.push(index.name);
    }
    if (!names.includes(indexName)) {
      const index: SearchIndex = {
        name: indexName,
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
            type: 'Collection(Edm.Double)',
            hidden: false,
            searchable: true,
            filterable: false,
            sortable: false,
            facetable: false,
            vectorSearchDimensions: 1536,
            vectorSearchConfiguration: 'default',
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
        semanticSettings: {
          configurations: [
            {
              name: 'default',
              prioritizedFields: {
                prioritizedContentFields: [{ name: 'content' }],
              },
            },
          ],
        },
        vectorSearch: {
          algorithmConfigurations: [
            {
              name: 'default',
              kind: 'hnsw',
              parameters: {
                metric: 'cosine',
              },
            },
          ],
        },
      };
      this.logger.debug(`Creating "${indexName}" search index...`);
      await searchIndexClient.createIndex(index);
    } else {
      this.logger.debug(`Search index "${indexName}" already exists`);
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

    const documentProcessor = new DocumentProcessor(this.logger);
    const document = await documentProcessor.createDocumentFromFile(filename, data, type, category);
    const sections = document.sections;
    if (options.useVectors) {
      await this.updateEmbeddingsInBatch(sections);
    }

    const searchClient = this.azure.searchIndex.getSearchClient(indexName);

    const batchSize = INDEXING_BATCH_SIZE;
    let batch: Section[] = [];

    for (let i = 0; i < sections.length; i++) {
      batch.push(sections[i]);

      if (batch.length === batchSize || i === sections.length - 1) {
        const { results } = await searchClient.uploadDocuments(batch);
        const succeeded = results.filter((r) => r.succeeded).length;
        const indexed = batch.length;
        this.logger.debug(`Indexed ${indexed} sections, ${succeeded} succeeded`);
        batch = [];
      }
    }
  }

  async removeFromIndex(indexName: string, filename?: string) {
    this.logger.debug(`Removing sections from "${filename ?? '<all>'}" from search index "${indexName}"`);
    const searchClient = this.azure.searchIndex.getSearchClient(indexName);

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

      // It can take a few seconds for search results to reflect changes, so wait a bit
      await wait(2000);
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    // TODO: add retry
    const embeddingsClient = await this.openai.getEmbeddings();
    // TODO: make model configurable in env vars
    const result = await embeddingsClient.create({ input: text, model: this.embeddingModelName });
    return result.data[0].embedding;
  }

  async createEmbeddingsInBatch(texts: string[]): Promise<Array<number[]>> {
    // TODO: add retry
    const embeddingsClient = await this.openai.getEmbeddings();
    // TODO: make model configurable in env vars
    const result = await embeddingsClient.create({ input: texts, model: this.embeddingModelName });
    return result.data.map((d) => d.embedding);
  }

  async updateEmbeddingsInBatch(sections: Section[]): Promise<Section[]> {
    const batchSize = MODELS_SUPPORTED_BATCH_SIZE[this.embeddingModelName];
    const batchQueue: Section[] = [];
    let tokenCount = 0;

    for (const [i, section] of sections.entries()) {
      tokenCount += getTokenCount(section.content, this.embeddingModelName);
      batchQueue.push(section);

      if (
        tokenCount > batchSize.tokenLimit ||
        batchQueue.length >= batchSize.maxBatchSize ||
        i === sections.length - 1
      ) {
        const embeddings = await this.createEmbeddingsInBatch(batchQueue.map((section) => section.content));
        batchQueue.forEach((section, i) => (section.embedding = embeddings[i]));
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
