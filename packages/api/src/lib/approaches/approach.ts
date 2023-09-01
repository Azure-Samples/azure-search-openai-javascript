import { SearchClient } from '@azure/search-documents';
import { OpenAiClients } from '../../plugins/openai.js';
import { removeNewlines } from '../util/index.js';
import { HistoryMessage } from '../message';

export interface ApproachResponse {
  data_points: string[];
  answer: string;
  thoughts: string;
}

export interface SearchDocumentsResult {
  query: string;
  results: string[];
  content: string;
}

export interface ChatApproach {
  run(history: HistoryMessage[], overrides: Record<string, any>): Promise<ApproachResponse>;
}

export interface AskApproach {
  run(q: string, overrides: Record<string, any>): Promise<ApproachResponse>;
}

export class ApproachBase {
  constructor(
    protected search: SearchClient<any>,
    protected openai: OpenAiClients,
    protected chatGptModel: string,
    protected sourcePageField: string,
    protected contentField: string,
  ) {}

  protected async searchDocuments(query?: string, overrides: Record<string, any> = {}): Promise<SearchDocumentsResult> {
    const hasText = ['text', 'hybrid', undefined].includes(overrides?.retrieval_mode);
    // const hasVectors = ['vectors', 'hybrid', undefined].includes(overrides?.retrieval_mode);
    const useSemanticCaption = Boolean(overrides?.use_semantic_caption) && hasText;
    const top = overrides?.top ? Number(overrides?.top) : 3;
    const excludeCategory: string | undefined = overrides?.exclude_category;
    const filter = excludeCategory ? `category ne '${excludeCategory.replace("'", "''")}'` : undefined;

    // If retrieval mode includes vectors, compute an embedding for the query
    // let queryVector;
    // if (hasVectors) {
    //   let openAiEmbeddings = await this.openai.getEmbeddings();
    //   const result = await openAiEmbeddings.create({
    //     model: 'text-embedding-ada-002',
    //     input: queryText!,
    //   });
    //   queryVector = result.data[0].embedding;
    // }

    // Only keep the text query if the retrieval mode uses text, otherwise drop it
    const queryText = hasText ? query : '';

    // Use semantic L2 reranker if requested and if retrieval mode is text or hybrid (vectors + text)
    let searchResults;
    // TODO: JS SDK is missing features: https://github.com/anfibiacreativa/azure-search-open-ai-javascript/issues/21
    // if (overrides?.semantic_ranker && hasText) {
    //   searchResults = await this.search.search(queryText, {
    //     filter,
    //     queryType: 'semantic',
    //     queryLanguage: 'en-us',
    //     querySpeller: 'lexicon',
    //     semanticConfigurationName: 'default',
    //     top,
    //     queryCaption: useSemanticCaption ? 'extractive|highlight-false' : undefined,
    //     vector: queryVector,
    //     topK: queryVector ? 50 : undefined,
    //     vectorFields: queryVector ? 'embedding' : undefined,
    //   }
    // } else {
    searchResults = await this.search.search(queryText, {
      filter,
      top,
      // vector: queryVector,
      // topK: queryVector ? 50 : undefined,
      // vectorFields: queryVector ? 'embedding' : undefined,
    });
    // }

    let results: string[] = [];
    if (useSemanticCaption) {
      for await (const result of searchResults.results) {
        // TODO: ensure typings
        const doc = result as any;
        const captions = doc['@search.captions'];
        const captionsText = captions.map((c: any) => c.text).join(' . ');
        results.push(`${doc[this.sourcePageField]}: ${removeNewlines(captionsText)}`);
      }
    } else {
      for await (const result of searchResults.results) {
        // TODO: ensure typings
        const doc = result.document as any;
        results.push(`${doc[this.sourcePageField]}: ${removeNewlines(doc[this.contentField])}`);
      }
    }
    const content = results.join('\n');
    return {
      query: queryText ?? '',
      results,
      content,
    };
  }

  protected async lookupDocument(query: string): Promise<any> {}
}
