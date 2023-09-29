import { type HistoryMessage } from '../message.js';

export interface ApproachResponse {
  data_points: string[];
  answer: string;
  thoughts: string;
}

export type ApproachResponseChunk = Partial<ApproachResponse>;

export type ApproachOverrides = {
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

export type ChatApproachOverrides = ApproachOverrides & {
  suggest_followup_questions?: boolean;
};

export interface ChatApproach {
  run(history: HistoryMessage[], overrides?: ChatApproachOverrides): Promise<ApproachResponse>;
  runWithStreaming(
    history: HistoryMessage[],
    overrides?: ChatApproachOverrides,
  ): AsyncGenerator<ApproachResponseChunk, void>;
}

export interface AskApproach {
  run(query: string, overrides?: ApproachOverrides): Promise<ApproachResponse>;
  runWithStreaming(query: string, overrides?: ApproachOverrides): AsyncGenerator<ApproachResponseChunk, void>;
}
