import { type Message } from '../message.js';

export interface ApproachResponse {
  choices: Array<{
    index: number;
    message: ApproachResponseMessage;
  }>;
  object: 'chat.completion';
}

export interface ApproachResponseChunk {
  choices: Array<{
    index: number;
    delta: Partial<ApproachResponseMessage>;
    finish_reason: string | null;
  }>;
  object: 'chat.completion.chunk';
}

export type ApproachResponseMessage = Message & {
  context?: Record<string, any> & {
    data_points?: string[];
    thoughts?: string;
  };
  session_state?: Record<string, any>;
};

export type ApproachContext = {
  retrieval_mode?: 'hybrid' | 'text' | 'vectors';
  semantic_ranker?: boolean;
  semantic_captions?: boolean;
  top?: number;
  temperature?: number;
  prompt_template?: string;
  prompt_template_prefix?: string;
  prompt_template_suffix?: string;
  exclude_category?: string;
};

export type ChatApproachContext = ApproachContext & {
  suggest_followup_questions?: boolean;
};

export interface ChatApproach {
  run(messages: Message[], context?: ChatApproachContext): Promise<ApproachResponse>;
  runWithStreaming(messages: Message[], context?: ChatApproachContext): AsyncGenerator<ApproachResponseChunk, void>;
}

export interface AskApproach {
  run(query: string, context?: ApproachContext): Promise<ApproachResponse>;
  runWithStreaming(query: string, context?: ApproachContext): AsyncGenerator<ApproachResponseChunk, void>;
}
