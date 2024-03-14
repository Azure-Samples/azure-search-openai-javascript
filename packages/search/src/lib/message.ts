export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
  role: MessageRole;
  content: string;
}

export function messageToString(message: Message): string {
  return `${message.role}: ${message.content}`;
}

export function messagesToString(messages: Message[]): string {
  return messages.map((m) => messageToString(m)).join('\n\n');
}
