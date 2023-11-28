export const enum Approaches {
  RetrieveThenRead = 'rtr',
  ReadRetrieveRead = 'rrr',
  ReadDecomposeAsk = 'rda',
}

export const enum RetrievalMode {
  Hybrid = 'hybrid',
  Vectors = 'vectors',
  Text = 'text',
}

export type AskRequestOverrides = {
  retrievalMode?: RetrievalMode;
  semanticRanker?: boolean;
  semanticCaptions?: boolean;
  excludeCategory?: string;
  top?: number;
  temperature?: number;
  promptTemplate?: string;
  promptTemplatePrefix?: string;
  promptTemplateSuffix?: string;
};

export type AskRequest = {
  question: string;
  context?: AskRequestOverrides & {
    approach?: Approaches;
  };
};

export type Message = {
  content: string;
  role: string;
  context?: Record<string, any> & {
    data_points?: string[];
    thoughts?: string;
  };
};

export type ChatResponse = {
  choices: Array<{
    index: number;
    message: Message;
  }>;
  error?: string;
};

export type ChatResponseChunk = {
  choices: Array<{
    index: number;
    delta: Partial<Message>;
  }>;
  error?: string;
};

export type ChatTurn = {
  user: string;
  bot?: string;
};

export type ChatRequest = {
  messages: ChatTurn[];
  stream?: boolean;
  context?: AskRequestOverrides & {
    approach?: Approaches;
    suggestFollowupQuestions?: boolean;
  };
};
