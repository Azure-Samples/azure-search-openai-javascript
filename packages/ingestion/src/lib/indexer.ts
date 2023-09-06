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
    private options: IndexerOptions = {},
  ) {}

  async createEmbedding(text: string) {
    const embeddingsClient = await this.openai.getEmbeddings();
    // TODO: make model configurable in env vars
    const result = await embeddingsClient.create({ input: text, model: 'text-embedding-ada-002' });
    return result.data[0].embedding;
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

    let i = 0;
    let batch: any[] = [];
    for (const s of sections) {
      batch.push(s);
      i += 1;
      if (i % 1000 === 0) {
        const { results } = await searchClient.uploadDocuments(batch);
        const succeeded = results.filter((r) => r.succeeded).length;
        if (this.options.verbose) {
          console.log(`Indexed ${results.length} sections, ${succeeded} succeeded`);
        }
        batch = [];
      }
    }

    if (batch.length > 0) {
      const { results } = await searchClient.uploadDocuments(batch);
      const succeeded = results.filter((r) => r.succeeded).length;
      if (this.options.verbose) {
        console.log(`Indexed ${results.length} sections, ${succeeded} succeeded`);
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
