export declare interface ChatMessageText {
  value: string;
  followingSteps?: string[];
}

// We declare a simple interface for the chat messages
// and the citations
export declare interface ChatMessage {
  text: ChatMessageText[];
  citations?: Citation[];
  followupQuestions?: string[];
  isUserMessage: boolean;
  timestamp: string;
}

export declare interface Citation {
  ref: number;
  text: string;
}

declare interface ProcessTextReturn {
  replacedText: string;
  arrays: Array<Array<string> | Array<Citation>>;
}

declare interface RequestOptions {
  method: string;
  approach: string;
  stream: boolean;
  overrides: RequestOverrides;
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
