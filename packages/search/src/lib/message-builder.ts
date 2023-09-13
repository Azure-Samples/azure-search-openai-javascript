import { getTokenCountFromMessages } from './tokens.js';
import { type Message, type MessageRole } from './message.js';

export class MessageBuilder {
  messages: Message[];
  model: string;
  tokens: number;

  /**
   * A class for building and managing messages in a chat conversation.
   * @param {string} systemContent The initial system message content.
   * @param {string} chatgptModel The name of the ChatGPT model.
   */
  constructor(systemContent: string, chatgptModel: string) {
    this.messages = [{ role: 'system', content: systemContent }];
    this.model = chatgptModel;
    this.tokens = getTokenCountFromMessages(this.messages[this.messages.length - 1], this.model);
  }

  /**
   * Append a new message to the conversation.
   * @param {MessageRole} role The role of the message sender.
   * @param {string} content The content of the message.
   * @param {number} index The index at which to insert the message.
   */
  appendMessage(role: MessageRole, content: string, index = 1) {
    this.messages.splice(index, 0, { role, content });
    this.tokens += getTokenCountFromMessages(this.messages[index], this.model);
  }
}
