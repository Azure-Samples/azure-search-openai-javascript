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

export const enum CustomStyles {
  AccentHigh = 'AccentHigh',
  AccentLight = 'AccentLighter',
  AccentDark = 'AccentContrast',
  TextColor = 'TextColor',
  BackgroundColor = 'BackgroundColor',
  FormBackgroundColor = 'FormBackgroundColor',
  ForegroundColor = 'ForegroundColor',
  BorderRadius = 'BorderRadius',
  BorderWidth = 'BorderWidth',
  FontBaseSize = 'FontBaseSize',
}

export type RequestOverrides = {
  retrieval_mode?: RetrievalMode;
  semantic_ranker?: boolean;
  semantic_captions?: boolean;
  exclude_category?: string;
  top?: number;
  temperature?: number;
  prompt_template?: string;
  prompt_template_prefix?: string;
  prompt_template_suffix?: string;
  suggest_followup_questions?: boolean;
};
