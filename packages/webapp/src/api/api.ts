import { type AskRequest, type ChatResponse, type ChatRequest } from './models.js';

export const apiBaseUrl = import.meta.env.VITE_SEARCH_API_URI ?? '';

export async function askApi(options: AskRequest): Promise<ChatResponse> {
  const response = await fetch(`${apiBaseUrl}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: options.question,
      context: {
        approach: options.context?.approach,
        retrieval_mode: options.context?.retrievalMode,
        semantic_ranker: options.context?.semanticRanker,
        semantic_captions: options.context?.semanticCaptions,
        top: options.context?.top,
        temperature: options.context?.temperature,
        prompt_template: options.context?.promptTemplate,
        prompt_template_prefix: options.context?.promptTemplatePrefix,
        prompt_template_suffix: options.context?.promptTemplateSuffix,
        exclude_category: options.context?.excludeCategory,
      },
    }),
  });

  const parsedResponse: ChatResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw new Error(parsedResponse.error || 'Unknown error');
  }

  return parsedResponse;
}

export async function chatApi(options: ChatRequest): Promise<ChatResponse | Response> {
  const response = await fetch(`${apiBaseUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: options.messages,
      stream: options.stream,
      context: {
        approach: options.context?.approach,
        retrieval_mode: options.context?.retrievalMode,
        semantic_ranker: options.context?.semanticRanker,
        semantic_captions: options.context?.semanticCaptions,
        top: options.context?.top,
        temperature: options.context?.temperature,
        prompt_template: options.context?.promptTemplate,
        prompt_template_prefix: options.context?.promptTemplatePrefix,
        prompt_template_suffix: options.context?.promptTemplateSuffix,
        exclude_category: options.context?.excludeCategory,
        suggest_followup_questions: options.context?.suggestFollowupQuestions,
      },
    }),
  });

  if (options.stream) {
    return response;
  }

  const parsedResponse: ChatResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw new Error(parsedResponse.error || 'Unknown error');
  }

  return parsedResponse;
}

export function getCitationFilePath(citation: string): string {
  return `${apiBaseUrl}/content/${citation}`;
}

export class NdJsonParserStream extends TransformStream<string, JSON> {
  private buffer: string = '';
  constructor() {
    let controller: TransformStreamDefaultController<JSON>;
    super({
      start: (_controller) => {
        controller = _controller;
      },
      transform: (chunk) => {
        const jsonChunks = chunk.split('\n').filter(Boolean);
        for (const jsonChunk of jsonChunks) {
          try {
            this.buffer += jsonChunk;
            controller.enqueue(JSON.parse(this.buffer));
            this.buffer = '';
          } catch {
            // Invalid JSON, wait for next chunk
          }
        }
      },
    });
  }
}

export async function* getChunksFromResponse<T>(response: Response): AsyncGenerator<T, void> {
  const reader = response.body?.pipeThrough(new TextDecoderStream()).pipeThrough(new NdJsonParserStream()).getReader();
  if (!reader) {
    throw new Error('No response body or body is not readable');
  }

  let value: JSON | undefined;
  let done: boolean;
  while ((({ value, done } = await reader.read()), !done)) {
    yield value as T;
  }
}
