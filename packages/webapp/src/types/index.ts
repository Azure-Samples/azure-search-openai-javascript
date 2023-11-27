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

export type Settings = {
  panelLabel?: string;
  panelTitle?: string;
  darkMode?: boolean;
  overridePromptTemplate?: AskRequestOverrides['promptTemplate'];
  overridePromptTemplatePrefix?: AskRequestOverrides['promptTemplatePrefix'];
  overridePromptTemplateSuffix?: AskRequestOverrides['promptTemplateSuffix'];
  excludeCategory?: AskRequestOverrides['excludeCategory'];
  retrievalMode?: string;
  followUpQuestions?: boolean;
  semanticRanker?: AskRequestOverrides['semanticRanker'];
  semanticCaptions?: AskRequestOverrides['semanticCaptions'];
  top?: AskRequestOverrides['top'];
  temperature?: AskRequestOverrides['temperature'];
  approach?: string;
  streaming?: boolean;
};
