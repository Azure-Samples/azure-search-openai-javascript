import { type SearchClient } from '@azure/search-documents';
import { type OpenAiService } from '../../plugins/openai.js';
import { messagesToString } from '../message.js';
import { MessageBuilder } from '../message-builder.js';
import {
  type ApproachResponse,
  type ApproachContext,
  type AskApproach,
  type ApproachResponseChunk,
} from './approach.js';
import { ApproachBase } from './approach-base.js';

const SYSTEM_CHAT_TEMPLATE = `You are an intelligent assistant helping Consto Real Estate company customers with support questions regarding terms of service, privacy policy, and questions about support requests.
Use 'you' to refer to the individual asking the questions even if they ask with 'I'.
Answer the following question using only the data provided in the sources below.
For tabular information return it as an html table. Do not return markdown format.
Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response.
If you cannot answer using the sources below, say you don't know. Use below example to answer`;

// shots/sample conversation
const QUESTION = `
'What happens if a guest breaks something?'

Sources:
info1.txt: Compensation for Damage Accidents can happen during a stay, and we have procedures in place to handle compensation for damage. If you, as a guest, notice damage during your stay or if you're a host and your property has been damaged, report it immediately through the platform
info2.pdf: Guests must not engage in any prohibited activities, including but not limited to: - Unauthorized parties or events - Smoking in non-smoking properties - Violating community rules - Damaging property or belongings
info3.pdf: Once you've provided the necessary information, submit the report. Our financial support team will investigate the matter and work to resolve it promptly.
`;

const ANSWER = `If a guest breaks something, report the damage immediately through the platform [info1.txt]. Once you've provided the necessary information, submit the report. Our financial support team will investigate the matter and work to resolve it promptly [info3.pdf].`;

/**
 * Simple retrieve-then-read implementation, using the AI Search and OpenAI APIs directly.
 * It first retrieves top documents from search, then constructs a prompt with them, and then uses
 * OpenAI to generate an completion (answer) with that prompt.
 */
export class AskRetrieveThenRead extends ApproachBase implements AskApproach {
  constructor(
    search: SearchClient<any>,
    openai: OpenAiService,
    chatGptModel: string,
    embeddingModel: string,
    sourcePageField: string,
    contentField: string,
  ) {
    super(search, openai, chatGptModel, embeddingModel, sourcePageField, contentField);
  }

  async run(userQuery: string, context?: ApproachContext): Promise<ApproachResponse> {
    const { query, results, content } = await this.searchDocuments(userQuery, context);
    const messageBuilder = new MessageBuilder(context?.prompt_template || SYSTEM_CHAT_TEMPLATE, this.chatGptModel);

    // Add user question
    const userContent = `${userQuery}\nSources:\n${content}`;
    messageBuilder.appendMessage('user', userContent);

    // Add shots/samples. This helps model to mimic response and make sure they match rules laid out in system message.
    messageBuilder.appendMessage('assistant', QUESTION);
    messageBuilder.appendMessage('user', ANSWER);

    const messages = messageBuilder.messages;

    const openAiChat = await this.openai.getChat();
    const chatCompletion = await openAiChat.completions.create({
      model: this.chatGptModel,
      messages,
      temperature: Number(context?.temperature ?? 0.3),
      max_tokens: 1024,
      n: 1,
    });

    const messageToDisplay = messagesToString(messages);

    return {
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant' as const,
            content: chatCompletion.choices[0].message.content ?? '',
            context: {
              data_points: { text: results },
              thoughts: `Question:<br>${query}<br><br>Prompt:<br>${messageToDisplay.replaceAll('\n', '<br>')}`,
            },
          },
        },
      ],
      object: 'chat.completion',
    };
  }

  // eslint-disable-next-line require-yield
  async *runWithStreaming(_query: string, _context?: ApproachContext): AsyncGenerator<ApproachResponseChunk, void> {
    throw new Error('Streaming not supported for this approach.');
  }
}
