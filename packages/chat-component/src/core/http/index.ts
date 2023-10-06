export async function callHtpApi(
  { question, type, approach, overrides }: ChatRequestOptions,
  { method, url, stream }: ChatHttpOptions,
) {
  return await fetch(`${url}${type}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // must enable history persistence
      history: [
        {
          user: question,
        },
      ],
      approach,
      overrides,
      stream,
    }),
  });
}

export async function getAPIResponse(
  requestOptions: ChatRequestOptions,
  httpOptions: ChatHttpOptions,
): Promise<BotResponse | Response> {
  const response = await callHtpApi(requestOptions, httpOptions);

  if (httpOptions.stream) {
    return response;
  }

  const parsedResponse: BotResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw new Error(response.statusText) || 'API Response Error';
  }
  return parsedResponse;
}
