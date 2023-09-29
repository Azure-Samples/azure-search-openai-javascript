import { type AskRequest, type AskResponse, type ChatRequest } from './models.js';

const baseUrl = import.meta.env.VITE_SEARCH_API_URI ?? '';

export async function askApi(options: AskRequest): Promise<AskResponse> {
  const response = await fetch(`${baseUrl}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: options.question,
      approach: options.approach,
      overrides: {
        retrieval_mode: options.overrides?.retrievalMode,
        semantic_ranker: options.overrides?.semanticRanker,
        semantic_captions: options.overrides?.semanticCaptions,
        top: options.overrides?.top,
        temperature: options.overrides?.temperature,
        prompt_template: options.overrides?.promptTemplate,
        prompt_template_prefix: options.overrides?.promptTemplatePrefix,
        prompt_template_suffix: options.overrides?.promptTemplateSuffix,
        exclude_category: options.overrides?.excludeCategory,
      },
    }),
  });

  const parsedResponse: AskResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw new Error(parsedResponse.error || 'Unknown error');
  }

  return parsedResponse;
}

export async function chatApi(options: ChatRequest): Promise<AskResponse | Response> {
  const response = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      history: options.history,
      approach: options.approach,
      stream: options.stream,
      overrides: {
        retrieval_mode: options.overrides?.retrievalMode,
        semantic_ranker: options.overrides?.semanticRanker,
        semantic_captions: options.overrides?.semanticCaptions,
        top: options.overrides?.top,
        temperature: options.overrides?.temperature,
        prompt_template: options.overrides?.promptTemplate,
        prompt_template_prefix: options.overrides?.promptTemplatePrefix,
        prompt_template_suffix: options.overrides?.promptTemplateSuffix,
        exclude_category: options.overrides?.excludeCategory,
        suggest_followup_questions: options.overrides?.suggestFollowupQuestions,
      },
    }),
  });

  if (options.stream) {
    return response;
  }

  const parsedResponse: AskResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw new Error(parsedResponse.error || 'Unknown error');
  }

  return parsedResponse;
}

export function getCitationFilePath(citation: string): string {
  return `/content/${citation}`;
}

export class NdJsonParserStream extends TransformStream<string, JSON> {
  constructor() {
    let controller: TransformStreamDefaultController<JSON>;
    super({
      start: (_controller) => {
        controller = _controller;
      },
      transform: (chunk) => {
        const jsonChunks = chunk.split('\n').filter(Boolean);
        for (const jsonChunk of jsonChunks) {
          controller.enqueue(JSON.parse(jsonChunk));
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
