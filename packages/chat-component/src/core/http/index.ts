import { ChatResponseError } from '../../utils/index.js';

export async function callHttpApi(
  { question, type, approach, overrides, messages }: ChatRequestOptions,
  { method, url, stream, signal }: ChatHttpOptions,
) {
  return await fetch(`${url}/${type}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      messages: [
        ...(messages ?? []),
        {
          content: question,
          role: 'user',
        },
      ],
      context: {
        ...overrides,
        approach,
      },
      stream: type === 'chat' ? stream : false,
    }),
  });
}

export async function getAPIResponse(
  requestOptions: ChatRequestOptions,
  httpOptions: ChatHttpOptions,
): Promise<BotResponse | Response> {
  const response = await callHttpApi(requestOptions, httpOptions);

  // TODO: we should just use the value from httpOptions.stream
  const streamResponse = requestOptions.type === 'ask' ? false : httpOptions.stream;
  if (streamResponse) {
    return response;
  }
  const parsedResponse: BotResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw new ChatResponseError(response.statusText, response.status) || 'API Response Error';
  }
  return parsedResponse;
}
