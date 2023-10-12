export async function callHttpApi(
  { question, type, approach, overrides }: ChatRequestOptions,
  { method, url, stream }: ChatHttpOptions,
) {
  const chatBody = JSON.stringify({
    history: [
      {
        user: question,
      },
    ],
    approach,
    overrides,
    stream,
  });
  const askBody = JSON.stringify({
    question,
    approach,
    overrides,
    stream: false,
  });
  const body = type === 'chat' ? chatBody : askBody;
  return await fetch(`${url}${type}`, {
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
