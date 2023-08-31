import { SearchClient } from '@azure/search-documents';
import { ChatApproach, ChatQueryResponse } from './approach.js';
import { OpenAiClients } from '../../plugins/openai.js';
import { removeNewlines } from '../util/index.js';
import { MessageBuilder } from '../message-builder.js';
import { getTokenLimit } from '../model-helpers.js';
import { HistoryMessage, Message, messageToString } from '../message.js';

const SYSTEM_MESSAGE_CHAT_CONVERSATION = `Assistant helps the company employees with their healthcare plan questions, and questions about the employee handbook. Be brief in your answers.
Answer ONLY with the facts listed in the list of sources below. If there isn't enough information below, say you don't know. Do not generate answers that don't use the sources below. If asking a clarifying question to the user would help, ask the question.
For tabular information return it as an html table. Do not return markdown format. If the question is not in English, answer in the language used in the question.
Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response. Use square brackets to reference the source, e.g. [info1.txt]. Don't combine sources, list each source separately, e.g. [info1.txt][info2.pdf].
{follow_up_questions_prompt}
{injected_prompt}
`;

const FOLLOW_UP_QUESTIONS_PROMPT_CONTENT = `Generate three very brief follow-up questions that the user would likely ask next about their healthcare plan and employee handbook.
Use double angle brackets to reference the questions, e.g. <<Are there exclusions for prescriptions?>>.
Try not to repeat questions that have already been asked.
Only generate questions and do not generate any text before or after the questions, such as 'Next Questions'`;

const QUERY_PROMPT_TEMPLATE = `Below is a history of the conversation so far, and a new question asked by the user that needs to be answered by searching in a knowledge base about employee healthcare plans and the employee handbook.
Generate a search query based on the conversation and the new question.
Do not include cited source filenames and document names e.g info.txt or doc.pdf in the search query terms.
Do not include any text inside [] or <<>> in the search query terms.
Do not include any special characters like '+'.
If the question is not in English, translate the question to English before generating the search query.
If you cannot generate a search query, return just the number 0.
`;

const QUERY_PROMPT_FEW_SHOTS: Message[] = [
  { role: 'user', content: 'What are my health plans?' },
  { role: 'assistant', content: 'Show available health plans' },
  { role: 'user', content: 'does my plan cover cardio?' },
  { role: 'assistant', content: 'Health plan cardio coverage' },
];

/**
 * Simple retrieve-then-read implementation, using the Cognitive Search and OpenAI APIs directly.
 * It first retrieves top documents from search, then constructs a prompt with them, and then uses
 * OpenAI to generate an completion (answer) with that prompt.
 */
export class ChatReadRetrieveRead implements ChatApproach {
  chatGptTokenLimit: number;

  constructor(
    private search: SearchClient<unknown>,
    private openai: OpenAiClients,
    private chatGptModel: string,
    private sourcePageField: string,
    private contentField: string,
  ) {
    this.chatGptTokenLimit = getTokenLimit(chatGptModel);
  }

  async run(history: HistoryMessage[], overrides: Record<string, any>): Promise<ChatQueryResponse> {
    const hasText = ['text', 'hybrid', undefined].includes(overrides?.retrieval_mode);
    // const hasVectors = ['vectors', 'hybrid', undefined].includes(overrides?.retrieval_mode);
    const useSemanticCaption = Boolean(overrides?.use_semantic_caption) && hasText;
    const top = overrides?.top ? Number(overrides?.top) : 3;
    const excludeCategory: string | undefined = overrides?.exclude_category;
    const filter = excludeCategory ? `category ne '${excludeCategory.replace("'", "''")}'` : undefined;
    const userQ = 'Generate search query for: ' + history[history.length - 1].user;

    // STEP 1: Generate an optimized keyword search query based on the chat history and the last question
    // -----------------------------------------------------------------------

    const messages = this.getMessagesFromHistory(
      QUERY_PROMPT_TEMPLATE,
      this.chatGptModel,
      history,
      userQ,
      QUERY_PROMPT_FEW_SHOTS,
      this.chatGptTokenLimit - userQ.length,
    );

    const openAiChat = await this.openai.getChat();
    const chatCompletion = await openAiChat.completions.create({
      model: this.chatGptModel,
      messages,
      temperature: 0,
      max_tokens: 32,
      n: 1,
    });

    let queryText = chatCompletion.choices[0].message.content?.trim();
    if (queryText === '0') {
      // Use the last user input if we failed to generate a better query
      queryText = history[history.length - 1].user;
    }

    // STEP 2: Retrieve relevant documents from the search index with the GPT optimized query
    // -----------------------------------------------------------------------

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
    if (!hasText) {
      queryText = undefined;
    }

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
    const followUpQuestionsPrompt = overrides?.suggest_followup_questions ? FOLLOW_UP_QUESTIONS_PROMPT_CONTENT : '';

    // STEP 3: Generate a contextual and content specific answer using the search results and chat history
    // -----------------------------------------------------------------------

    // Allow client to replace the entire prompt, or to inject into the exiting prompt using >>>
    const promptOverride = overrides?.prompt_override;
    let systemMessage: string;
    if (promptOverride?.startsWith('>>>')) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', promptOverride.slice(3) + '\n');
    } else if (promptOverride) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', promptOverride);
    } else {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', '');
    }

    const finalMessages = this.getMessagesFromHistory(
      systemMessage,
      this.chatGptModel,
      history,
      // Model does not handle lengthy system messages well.
      // Moving sources to latest user conversation to solve follow up questions prompt.
      `${history[history.length - 1].user}\n\nSources:\n${content}`,
      [],
      this.chatGptTokenLimit,
    );

    const finalChatCompletion = await openAiChat.completions.create({
      model: this.chatGptModel,
      messages: finalMessages,
      temperature: overrides?.temperature ?? 0.7,
      max_tokens: 1024,
      n: 1,
    });

    const chatContent = finalChatCompletion.choices[0].message.content ?? '';
    const messageToDisplay = messages.map((m) => messageToString(m)).join('\n\n');

    return {
      data_points: results,
      answer: chatContent,
      thoughts: `Searched for:<br>${queryText}<br><br>Conversations:<br>${messageToDisplay.replace('\n', '<br>')}`,
    };
  }

  private getMessagesFromHistory(
    systemPrompt: string,
    model: string,
    history: HistoryMessage[],
    userConv: string,
    fewShots: Message[] = [],
    maxTokens = 4096,
  ): Message[] {
    const messageBuilder = new MessageBuilder(systemPrompt, model);

    // Add examples to show the chat what responses we want.
    // It will try to mimic any responses and make sure they match the rules laid out in the system message.
    for (const shot of fewShots) {
      messageBuilder.appendMessage(shot.role, shot.content);
    }

    const userContent = userConv;
    const appendIndex = fewShots.length + 1;

    messageBuilder.appendMessage('user', userContent, appendIndex);

    for (let i = history.length - 2; i >= 0; i--) {
      const h = history[i];
      if (h.bot) {
        messageBuilder.appendMessage('assistant', h.bot, appendIndex);
      }
      if (h.user) {
        messageBuilder.appendMessage('user', h.user, appendIndex);
      }
      if (messageBuilder.tokens > maxTokens) {
        break;
      }
    }

    const messages = messageBuilder.messages.slice(1);
    return messages.map((m) => ({ role: m.role, content: m.content }));
  }
}
