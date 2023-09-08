export interface ModelLimit {
  tokenLimit: number;
  maxBatchSize: number;
}

export const MODELS_SUPPORTED_BATCH_SIZE: Record<string, ModelLimit> = {
  'text-embedding-ada-002': {
    tokenLimit: 8100,
    maxBatchSize: 16,
  },
};
