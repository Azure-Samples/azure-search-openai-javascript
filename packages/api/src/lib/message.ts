export type MessageRole = 'system' | 'user' | 'assistant' | 'function';

export interface Message {
  role: MessageRole;
  content: string;
}

export function messageToString(message: Message): string {
  return `${message.role}: ${message.content}`;
}
