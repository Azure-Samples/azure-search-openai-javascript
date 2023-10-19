import { type SearchClient } from '@azure/search-documents';
import { type OpenAiService } from '../../plugins/openai.js';
import { parseBoolean, removeNewlines } from '../util/index.js';
import { type ApproachContext } from './approach.js';

export interface SearchDocumentsResult {
  query: string;
  results: string[];
  content: string;
}

export class ApproachBase {
  constructor(
    protected search: SearchClient<any>,
    protected openai: OpenAiService,
    protected chatGptModel: string,
    protected embeddingModel: string,
    protected sourcePageField: string,
    protected contentField: string,
  ) {}

  protected async searchDocuments(query?: string, context: ApproachContext = {}): Promise<SearchDocumentsResult> {
    const hasText = ['text', 'hybrid', undefined].includes(context?.retrieval_mode);
    const hasVectors = ['vectors', 'hybrid', undefined].includes(context?.retrieval_mode);
    const useSemanticCaption = parseBoolean(context?.semantic_captions) && hasText;
    const top = context?.top ? Number(context?.top) : 3;
    const excludeCategory: string | undefined = context?.exclude_category;
    const filter = excludeCategory ? `category ne '${excludeCategory.replace("'", "''")}'` : undefined;

    // If retrieval mode includes vectors, compute an embedding for the query
    let queryVector;
    if (hasVectors) {
      const openAiEmbeddings = await this.openai.getEmbeddings();
      const result = await openAiEmbeddings.create({
        model: this.embeddingModel,
        input: query!,
      });
      queryVector = result.data[0].embedding;
    }

    // Only keep the text query if the retrieval mode uses text, otherwise drop it
    const queryText = hasText ? query : '';

    // Use semantic L2 reranker if requested and if retrieval mode is text or hybrid (vectors + text)
    const searchResults = await (context?.semantic_ranker && hasText
      ? this.search.search(queryText, {
          filter,
          queryType: 'semantic',
          queryLanguage: 'en-us',
          speller: 'lexicon',
          semanticConfiguration: 'default',
          top,
          captions: useSemanticCaption ? 'extractive|highlight-false' : undefined,
          vectors: [
            {
              value: queryVector,
              kNearestNeighborsCount: queryVector ? 50 : undefined,
              fields: queryVector ? ['embedding'] : undefined,
            },
          ],
        })
      : this.search.search(queryText, {
          filter,
          top,
          vectors: [
            {
              value: queryVector,
              kNearestNeighborsCount: queryVector ? 50 : undefined,
              fields: queryVector ? ['embedding'] : undefined,
            },
          ],
        }));

    const results: string[] = [];
    if (useSemanticCaption) {
      for await (const result of searchResults.results) {
        // TODO: ensure typings
        const document = result as any;
        const captions = document['@search.captions'];
        const captionsText = captions?.map((c: any) => c.text).join(' . ');
        results.push(`${document[this.sourcePageField]}: ${removeNewlines(captionsText)}`);
      }
    } else {
      for await (const result of searchResults.results) {
        // TODO: ensure typings
        const document = result.document as any;
        results.push(`${document[this.sourcePageField]}: ${removeNewlines(document[this.contentField])}`);
      }
    }
    const content = results.join('\n');
    return {
      query: queryText ?? '',
      results,
      content,
    };
  }

  protected async lookupDocument(query: string): Promise<any> {
    const searchResults = await this.search.search(query, {
      top: 1,
      includeTotalCount: true,
      queryType: 'semantic',
      queryLanguage: 'en-us',
      speller: 'lexicon',
      semanticConfiguration: 'default',
      answers: 'extractive|count-1',
      captions: 'extractive|highlight-false',
    });

    const answers = await searchResults.answers;
    if (answers && answers.length > 0) {
      return answers[0].text;
    }
    if (searchResults.count ?? 0 > 0) {
      const results: string[] = [];
      for await (const result of searchResults.results) {
        // TODO: ensure typings
        const document = result.document as any;
        results.push(document[this.contentField]);
      }
      return results.join('\n');
    }
    return undefined;
  }
}
