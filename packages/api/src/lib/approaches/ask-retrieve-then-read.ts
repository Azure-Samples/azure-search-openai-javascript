import { SearchClient } from '@azure/search-documents';
import { OpenAiClients } from '../../plugins/openai.js';
import { removeNewlines } from '../util/index.js';
import { MessageBuilder } from '../message-builder.js';
import { AskApproach } from './approach.js';
import { messagesToString } from '../message.js';

const SYSTEM_CHAT_TEMPLATE = `You are an intelligent assistant helping Contoso Inc employees with their healthcare plan questions and employee handbook questions.
Use 'you' to refer to the individual asking the questions even if they ask with 'I'.
Answer the following question using only the data provided in the sources below.
For tabular information return it as an html table. Do not return markdown format.
Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response.
If you cannot answer using the sources below, say you don't know. Use below example to answer`;

// shots/sample conversation
const QUESTION = `
'What is the deductible for the employee plan for a visit to Overlake in Bellevue?'

Sources:
info1.txt: deductibles depend on whether you are in-network or out-of-network. In-network deductibles are $500 for employee and $1000 for family. Out-of-network deductibles are $1000 for employee and $2000 for family.
info2.pdf: Overlake is in-network for the employee plan.
info3.pdf: Overlake is the name of the area that includes a park and ride near Bellevue.
info4.pdf: In-network institutions include Overlake, Swedish and others in the region
`;

const ANSWER = `In-network deductibles are $500 for employee and $1000 for family [info1.txt] and Overlake is in-network for the employee plan [info2.pdf][info4.pdf].`;

/**
 * Simple retrieve-then-read implementation, using the Cognitive Search and OpenAI APIs directly.
 * It first retrieves top documents from search, then constructs a prompt with them, and then uses
 * OpenAI to generate an completion (answer) with that prompt.
 */
export class AskRetrieveThenReadApproach implements AskApproach {
  constructor(
    private search: SearchClient<any>,
    private openai: OpenAiClients,
    private chatGptModel: string,
    private sourcePageField: string,
    private contentField: string,
  ) {}

  async run(q: string, overrides: Record<string, any>): Promise<any> {
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
    const queryText = hasText ? q : '';

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

    const messageBuilder = new MessageBuilder(overrides?.prompt_template || SYSTEM_CHAT_TEMPLATE, this.chatGptModel);

    // Add user question
    const userContent = `${q}\nSources:\n${content}`;
    messageBuilder.appendMessage('user', userContent);

    // Add shots/samples. This helps model to mimic response and make sure they match rules laid out in system message.
    messageBuilder.appendMessage('assistant', QUESTION);
    messageBuilder.appendMessage('user', ANSWER);

    const messages = messageBuilder.messages;

    const openAiChat = await this.openai.getChat();
    const chatCompletion = await openAiChat.completions.create({
      model: this.chatGptModel,
      messages,
      temperature: overrides?.temperature ?? 0.3,
      max_tokens: 1024,
      n: 1,
    });

    const messageToDisplay = messagesToString(messages);

    return {
      data_points: results,
      answer: chatCompletion.choices[0].message.content ?? '',
      thoughts: `Question:<br>${queryText}<br><br>Prompt:<br>${messageToDisplay.replace('\n', '<br>')}`,
    };
  }
}
