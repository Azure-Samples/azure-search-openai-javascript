import { NdJsonParserStream } from './data-format/ndjson.js';
import { globalConfig } from '../../config/global-config.js';

export function createReader(responseBody: ReadableStream<Uint8Array> | null) {
  return responseBody?.pipeThrough(new TextDecoderStream()).pipeThrough(new NdJsonParserStream()).getReader();
}

export async function* readStream<T>(reader: any): AsyncGenerator<T, void> {
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

// Stop stream
export function cancelStream<T>(stream: ReadableStream<T> | null): void {
  if (stream) {
    stream.cancel();
  }
}
