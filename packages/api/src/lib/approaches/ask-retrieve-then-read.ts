import { SearchClient } from '@azure/search-documents';
import { OpenAiService } from '../../plugins/openai.js';
import { messagesToString } from '../message.js';
import { MessageBuilder } from '../message-builder.js';
import { AskApproach } from './approach.js';
import { ApproachBase } from './approach-base.js';

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
export class AskRetrieveThenRead extends ApproachBase implements AskApproach {
  constructor(
    search: SearchClient<any>,
    openai: OpenAiService,
    chatGptModel: string,
    sourcePageField: string,
    contentField: string,
  ) {
    super(search, openai, chatGptModel, sourcePageField, contentField);
  }

  async run(userQuery: string, overrides: Record<string, any>): Promise<any> {
    const { query, results, content } = await this.searchDocuments(userQuery, overrides);
    const messageBuilder = new MessageBuilder(overrides?.prompt_template || SYSTEM_CHAT_TEMPLATE, this.chatGptModel);

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
      temperature: overrides?.temperature ?? 0.3,
      max_tokens: 1024,
      n: 1,
    });

    const messageToDisplay = messagesToString(messages);

    return {
      data_points: results,
      answer: chatCompletion.choices[0].message.content ?? '',
      thoughts: `Question:<br>${query}<br><br>Prompt:<br>${messageToDisplay.replace('\n', '<br>')}`,
    };
  }
}
