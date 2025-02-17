import { encoding_for_model, type TiktokenModel } from '@dqbd/tiktoken';
import { type Message } from './message.js';

const MODEL_TOKEN_LIMITS: Record<string, number> = {
  'gpt-35-turbo': 4000,
  'gpt-3.5-turbo': 4000,
  'gpt-35-turbo-16k': 16_000,
  'gpt-3.5-turbo-16k': 16_000,
  'gpt-4': 8100,
  'gpt-4-32k': 32_000,
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
};

const AZURE_OPENAI_TO_TIKTOKEN_MODELS: Record<string, string> = {
  'gpt-35-turbo': 'gpt-3.5-turbo',
  'gpt-35-turbo-16k': 'gpt-35-turbo-16k',
};

/**
 * Get the maximum number of tokens allowed for a given model.
 * @param {string} model The name of the model.
 * @returns {number} The maximum number of tokens allowed for the model.
 */
export function getTokenLimit(model: string): number {
  if (!(model in MODEL_TOKEN_LIMITS)) {
    throw new Error('Expected model gpt-35-turbo and above');
  }
  return MODEL_TOKEN_LIMITS[model];
}

/**
 * Calculate the number of tokens required to encode a message.
 * @param {Message} message The message to encode.
 * @param {string} model The name of the model to use for encoding.
 * @returns {number} The total number of tokens required to encode the message.
 * @example
 * const message = { role: 'user', content: 'Hello, how are you?' };
 * const model = 'gpt-3.5-turbo';
 * getTokenCountFromMessages(message, model);
 * // output: 11
 */
export function getTokenCountFromMessages(message: Message, model: string): number {
  const encoder = encoding_for_model(getTiktokenModel(model) as TiktokenModel);
  let tokens = 2; // For "role" and "content" keys
  for (const value of Object.values(message)) {
    tokens += encoder.encode(value).length;
  }
  encoder.free();
  return tokens;
}

/**
 * Get the OpenAI model name from the Azure OpenAI model name.
 * @param {string} azureModel The Azure OpenAI model name.
 * @returns {string} The corresponding OpenAI model name.
 * @throws {Error} If the input model name is invalid.
 * @example
 * get_oai_chatmodel_tiktok('chat-gpt-3');
 * // output: 'gpt3'
 */
function getTiktokenModel(azureModel: string): string {
  const message = 'Expected Azure OpenAI ChatGPT model name';
  if (!azureModel) {
    throw new Error(message);
  }
  if (!(azureModel in MODEL_TOKEN_LIMITS) && !(azureModel in AZURE_OPENAI_TO_TIKTOKEN_MODELS)) {
    throw new Error(message);
  }
  return AZURE_OPENAI_TO_TIKTOKEN_MODELS[azureModel] ?? azureModel;
}
