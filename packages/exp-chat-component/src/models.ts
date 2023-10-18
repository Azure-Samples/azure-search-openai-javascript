export type Message = {
  content: string;
  role: string;
};

export type ChatMessage = Message & {
  context?: Record<string, any> & {
    data_points?: string[];
    thoughts?: string;
  };
};

export type ChatResponse = {
  choices: Array<{
    index: number;
    message: ChatMessage;
  }>;
  error?: string;
};

export type ChatResponseChunk = {
  choices: Array<{
    index: number;
    delta: Partial<ChatMessage>;
  }>;
  error?: string;
};

export type Approaches = 'rtr' | 'rrr';

export type RetrievalMode = 'hybrid' | 'vectors' | 'text';

export type ChatRequestOptions = {
  messages: Message[];
  stream: boolean;
  approach: Approaches;
  suggestFollowupQuestions: boolean;
  chunkIntervalMs: number;
} & ChatRequestOverrides;

export type ChatRequestOverrides = {
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
