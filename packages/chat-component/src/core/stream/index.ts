import { NdJsonParserStream } from './data-format/ndjson.js';
import { globalConfig } from '../../config/global-config.js';

export async function* readStream<T>(responseBody: ReadableStream<Uint8Array> | null): AsyncGenerator<T, void> {
  const reader = responseBody?.pipeThrough(new TextDecoderStream()).pipeThrough(new NdJsonParserStream()).getReader();
  if (!reader) {
    throw new Error('No response body or body is not readable');
  }

  let value: JSON | undefined;
  let done: boolean;
  while ((({ value, done } = await reader.read()), !done)) {
    yield new Promise<T>((resolve) => {
      setTimeout(() => {
        resolve(value as T);
      }, globalConfig.BOT_TYPING_EFFECT_INTERVAL);
    });
  }
}
