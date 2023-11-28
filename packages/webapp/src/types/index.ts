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
  useSemanticRanker?: boolean;
  useSemanticCaptions?: boolean;
  excludeCategory?: string;
  top?: number;
  temperature?: number;
  promptTemplate?: string;
  promptTemplatePrefix?: string;
  promptTemplateSuffix?: string;
  suggestFollowupQuestions?: boolean;
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
  retrievalMode?: RetrievalMode;
  followUpQuestions?: AskRequestOverrides['suggestFollowupQuestions'];
  semanticRanker?: AskRequestOverrides['useSemanticRanker'];
  semanticCaptions?: AskRequestOverrides['useSemanticCaptions'];
  top?: AskRequestOverrides['top'];
  temperature?: AskRequestOverrides['temperature'];
  approach?: string;
  streaming?: boolean;
};
