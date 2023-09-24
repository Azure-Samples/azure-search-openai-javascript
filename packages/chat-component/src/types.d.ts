// For simplicity, we declare a simple interface for the chat messages
// in the same file. You may want to move this to a separate file, or
// together with existing interfaces in your app.
export declare interface ChatMessage {
  text: string;
  isUserMessage: boolean;
  timestamp: string;
  citations: Citation[];
  followingSteps: string[];
  followupQuestions: string[];
}

export declare interface Citation {
  ref: number;
  text: string;
}
