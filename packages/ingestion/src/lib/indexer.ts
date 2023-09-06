import { SearchIndex } from '@azure/search-documents';
import { AzureClients } from '../plugins/azure';
import { OpenAiService } from '../plugins/openai';
import { wait } from './util/index.js';

export interface IndexerOptions {
  verbose?: boolean;
}

export class Indexer {
  constructor(
    private azure: AzureClients,
    private openai: OpenAiService,
    private name: string,
    private embeddingModelName: string = 'text-embedding-ada-002',
    private options: IndexerOptions = {},
  ) {}

  async createEmbedding(text: string): Promise<number[]> {
    const embeddingsClient = await this.openai.getEmbeddings();
    // TODO: make model configurable in env vars
    const result = await embeddingsClient.create({ input: text, model: this.embeddingModelName });
    return result.data[0].embedding;
  }

  async batchCreateEmbeddings(texts: string[]): Promise<Array<number[]>> {
    const embeddingsClient = await this.openai.getEmbeddings();
    // TODO: make model configurable in env vars
    const result = await embeddingsClient.create({ input: texts, model: this.embeddingModelName });
    return result.data.map((d) => d.embedding);
  }

  async createSearchIndex() {
    if (this.options.verbose) {
      console.log(`Ensuring search index "${this.name}" exists`);
    }

    const searchIndexClient = this.azure.searchIndex;

    const names: string[] = [];
    const indexNames = await searchIndexClient.listIndexes();
    for await (const index of indexNames) {
      names.push(index.name);
    }
    if (!names.includes(this.name)) {
      const index: SearchIndex = {
        name: this.name,
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
      if (this.options.verbose) {
        console.log(`Creating "${this.name}" search index...`);
      }
      await searchIndexClient.createIndex(index);
    } else {
      if (this.options.verbose) {
        console.log(`Search index "${this.name}" already exists`);
      }
    }
  }

  async indexSections(filename: string, sections: any[]) {
    if (this.options.verbose) {
      console.log(`Indexing sections from "${filename}" into search index "${this.name}..."`);
    }
    const searchClient = this.azure.searchIndex.getSearchClient(this.name);

    const batchSize = 1000;
    let batch: any[] = [];

    for (let i = 0; i < sections.length; i++) {
      batch.push(sections[i]);

      if (batch.length === batchSize || i === sections.length - 1) {
        const { results } = await searchClient.uploadDocuments(batch);
        const succeeded = results.filter((r) => r.succeeded).length;
        const indexed = batch.length;
        console.log(`Indexed ${indexed} sections, ${succeeded} succeeded`);
        batch = [];
      }
    }
  }

  async removeFromIndex(filename?: string) {
    if (this.options.verbose) {
      console.log(`Removing sections from "${filename ?? '<all>'}" from search index "${this.name}"`);
    }
    const searchClient = this.azure.searchIndex.getSearchClient(this.name);

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
      if (this.options.verbose) {
        console.log(`\tRemoved ${results.length} sections from index`);
      }

      // It can take a few seconds for search results to reflect changes, so wait a bit
      await wait(2000);
    }
  }
}
