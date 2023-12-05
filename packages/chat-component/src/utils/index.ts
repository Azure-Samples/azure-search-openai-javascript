// Util functions to process text from response, clean it up and style it
// We keep it in this util file because we may not need it once we introduce
// a new response format with TypeChat or a similar component

// Let's give the response a type so we can use it in the component

export function processText(inputText: string, arrays: Array<Array<string> | Array<Citation>>): ProcessTextReturn {
  // Keeping all the regex at this level so they can be easily changed or removed
  const nextQuestionMatch = `Next questions:|<<([^>]+)>>`;
  const findCitations = /\[(.*?)]/g;
  const findFollowingSteps = /:(.*?)(?:Follow-up questions:|Next questions:|<<|$)/s;
  const findNextQuestions = /Next Questions:(.*?)$/s;
  const findQuestionsbyDoubleArrow = /<<([^<>]+)>>/g;
  const findNumberedItems = /^\d+\.\s/;
  // Find and process citations
  const citation: NonNullable<unknown> = {};
  let citations: Citation[] = [];
  let referenceCounter = 1;
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  let replacedText = inputText.replace(findCitations, (_match, capture) => {
    const citationText = capture.trim();
    if (!citation[citationText]) {
      citation[citationText] = referenceCounter++;
    }
    return `<sup class="citation">${citation[citationText]}</sup>`;
  });
  citations = Object.keys(citation).map((text, index) => ({
    ref: index + 1,
    text,
  }));
  arrays[0] = citations;

  // Because the format for followup questions is inconsistent
  // and sometimes it includes a Next Questions prefix, we need  do some extra work
  const hasNextQuestions = replacedText.includes(nextQuestionMatch);
  // Find and store 'follow this steps' portion of the response
  // considering the fact that sometimes the 'next questions' indicator is present
  // and sometimes it's not
  const followingStepsMatch = replacedText.match(findFollowingSteps);
  const followingStepsText = followingStepsMatch ? followingStepsMatch[1].trim() : '';
  const followingSteps = followingStepsText.split('\n').filter(Boolean);
  const cleanFollowingSteps = followingSteps.map((item) => {
    return item.replace(findNumberedItems, '');
  });
  arrays[1] = cleanFollowingSteps;

  // Determine which regex to use, depending if the indicator is present
  const nextRegex = hasNextQuestions ? findNextQuestions : findQuestionsbyDoubleArrow;
  const nextQuestionsMatch = replacedText.match(nextRegex) ?? [];
  let nextQuestions: string[] = [];
  nextQuestions = cleanUpFollowUp([...(nextQuestionsMatch as string[])]);

  // Remove the 'steps', 'citation' and 'next questions' portions of the response
  // from the response answer
  const stepsIndex = replacedText.indexOf('s:');
  // eslint-disable-next-line unicorn/no-negated-condition, unicorn/prefer-string-slice
  replacedText = stepsIndex !== -1 ? inputText.substring(0, stepsIndex + 6) : inputText;

  arrays[2] = nextQuestions;
  return { replacedText, arrays };
}

// Clean up responses with << and >>
export function cleanUpFollowUp(followUpList: string[]): string[] {
  if (followUpList && followUpList.length > 0 && followUpList[0].startsWith('<<')) {
    followUpList = followUpList.map((followUp) => followUp.replace('<<', '').replace('>>', ''));
  }
  return followUpList;
}

// Get the current timestamp to display with the chat message
export function getTimestamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

export function chatEntryToString(entry: ChatThreadEntry) {
  const message = entry.text
    .map((textEntry) => textEntry.value + '\n\n' + textEntry.followingSteps?.map((s, i) => `${i + 1}.` + s).join('\n'))
    .join('\n\n')
    .replaceAll(/<sup[^>]*>(.*?)<\/sup>/g, ''); // remove the <sup> tags from the message

  return message;
}

// Creates a new chat message error
export class ChatResponseError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}

export function newListWithEntryAtIndex<T>(list: T[], index: number, entry: T) {
  return [...list.slice(0, index), entry, ...list.slice(index + 1)];
}
