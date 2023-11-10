declare interface ChatHttpOptions {
  method: string;
  url: string;
  stream: boolean;
  signal: AbortSignal;
}
declare interface ChatMessageText {
  value: string;
  followingSteps?: string[];
}

// We declare a simple interface for the chat messages
// and the citations
declare interface ChatThreadEntry {
  text: ChatMessageText[];
  citations?: Citation[];
  followupQuestions?: string[];
  isUserMessage: boolean;
  timestamp: string;
  error?: {
    message: string;
  };
}

declare interface Citation {
  ref: number;
  text: string;
}

declare interface ProcessTextReturn {
  replacedText: string;
  arrays: Array<Array<string> | Array<Citation>>;
}

declare interface ChatRequestOptions {
  approach: string;
  overrides: RequestOverrides;
  type: string;
  question: string;
}

declare interface RequestOverrides {
  retrieval_mode?: string;
  semantic_ranker?: boolean;
  semantic_captions?: boolean;
  top?: number;
  suggest_followup_questions?: boolean;
  temperature?: number;
  prompt_template?: string;
  prompt_template_prefix?: string;
  prompt_template_suffix?: string;
  exclude_category?: string[];
}

declare interface BotResponse {
  answer: string;
  thoughts: string | null;
  data_points: string[];
  error?: string;
  done?: boolean;
}

declare type MessageRole = 'system' | 'user' | 'assistant' | 'function';

declare interface Message {
  role: MessageRole;
  content: string;
}

declare interface BotResponse {
  choices: Array<{
    index: number;
    message: BotResponseMessage;
  }>;
  object: 'chat.completion';
}

declare interface BotResponseChunk {
  choices: Array<{
    index: number;
    delta: Partial<BotResponseMessage>;
    finish_reason: string | null;
  }>;
  object: 'chat.completion.chunk';
}

declare type BotResponseMessage = Message & {
  context?: Record<string, any> & {
    data_points?: string[];
    thoughts?: string;
  };
  session_state?: Record<string, any>;
};

declare interface BotResponseError {
  statusCode: number;
  error: string;
  code: string;
  message: string;
}
