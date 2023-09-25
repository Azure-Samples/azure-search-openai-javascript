// We declare a simple interface for the chat messages
// and the citations
export declare interface ChatMessage {
  text: string;
  isUserMessage: boolean;
  timestamp: string;
  citations?: Citation[];
  followingSteps?: string[];
  followupQuestions?: string[];
}

export declare interface Citation {
  ref: number;
  text: string;
}

declare interface ProcessTextReturn {
  replacedText: string;
  arrays: Array<Array<string> | Array<Citation>>;
}
