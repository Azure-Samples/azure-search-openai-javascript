export async function callHttpApi(
  { question, type, approach, overrides }: ChatRequestOptions,
  { method, url, stream }: ChatHttpOptions,
) {
  const chatBody = JSON.stringify({
    messages: [
      {
        user: question,
      },
    ],
    context: {
      ...overrides,
      approach,
    },
    stream,
  });
  const askBody = JSON.stringify({
    question,
    context: {
      ...overrides,
      approach,
    },
    stream: false,
  });
  const body = type === 'chat' ? chatBody : askBody;
  return await fetch(`${url}/${type}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
}

export async function getAPIResponse(
  requestOptions: ChatRequestOptions,
  httpOptions: ChatHttpOptions,
): Promise<BotResponse | Response> {
  const response = await callHttpApi(requestOptions, httpOptions);
  const streamResponse = requestOptions.type === 'ask' ? false : httpOptions.stream;
  if (streamResponse) {
    return response;
  }
  const parsedResponse: BotResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw new Error(response.statusText) || 'API Response Error';
  }
  return parsedResponse;
}
