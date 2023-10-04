import { NdJsonParserStream } from './data-format/ndjson.ts';
import { globalConfig } from '../../config/global-config.js';

export async function* readStream<T>(response: Response): AsyncGenerator<T, void> {
  const reader = response.body?.pipeThrough(new TextDecoderStream()).pipeThrough(new NdJsonParserStream()).getReader();
  if (!reader) {
    throw new Error('No response body or body is not readable');
  }

  let value: JSON | undefined;
  let done: boolean;
  while ((({ value, done } = await reader.read()), !done)) {
    console.log({
      value,
    });
    yield new Promise<T>((resolve /*, reject*/) => {
      setTimeout(() => {
        resolve(value as T);
      }, globalConfig.BOT_TYPING_EFFECT_INTERVAL);
    });
  }
}
