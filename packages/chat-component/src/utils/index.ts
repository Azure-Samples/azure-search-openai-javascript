// Util functions to process text from response, clean it up and style it
// We keep it in this util file because we may not need it once we introduce
// a new response format with TypeChat or a similar component
import { NEXT_QUESTION_INDICATOR } from '../config/global-config.js';

// Let's give the response a type so we can use it in the component

export function processText(inputText: string, arrays: Array<Array<string> | Array<Citation>>): ProcessTextReturn {
  // Keeping all the regex at this level so they can be easily changed or removed
  const nextQuestionIndicator = NEXT_QUESTION_INDICATOR;
  const findCitations = /\[(.*?)]/g;
  const findFollowingSteps = /steps:(.*?)(?:Next Questions:|<<|$)/s;
  const findNextQuestions = /Next Questions:(.*?)$/s;
  const findQuestionsbyDoubleArrow = /<<([^<>]+)>>/g;
  const findNumberedItems = /\d+\.\s+/;

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
    return `[${citation[citationText]}]`;
  });
  citations = Object.keys(citation).map((text, index) => ({
    ref: index + 1,
    text,
  }));
  arrays[0] = citations;

  // Because the format for followup questions is inconsistent
  // and sometimes it includes a Next Questions prefix, we need  do some extra work
  const nextQuestionsIndex = replacedText.indexOf(nextQuestionIndicator);
  const hasNextQuestions = nextQuestionsIndex !== -1;
  // Find and store 'follow this steps' portion of the response
  // considering the fact that sometimes the 'next questions' indicator is present
  // and sometimes it's not
  const followingStepsMatch = replacedText.match(findFollowingSteps);
  const followingStepsText = followingStepsMatch ? followingStepsMatch[1].trim() : '';
  const followingSteps = followingStepsText.split('\n').filter(Boolean);
  arrays[1] = followingSteps;

  // Determine which regex to use, depending if the indicator is present
  const nextRegex = hasNextQuestions ? findNextQuestions : findQuestionsbyDoubleArrow;
  const nextQuestionsMatch = replacedText.match(nextRegex);
  const nextQuestionsText = nextQuestionsMatch ? nextQuestionsMatch[1].trim() : '';
  let nextQuestions: string[] = [];
  // Find and store 'follow up questions' portion of the response
  if (hasNextQuestions) {
    // Remove the 'Next Questions' prefix from the response
    replacedText = replacedText.replace(nextQuestionIndicator, '');
    nextQuestions = nextQuestionsText.split(findNumberedItems).filter(Boolean);
  } else {
    nextQuestions = nextQuestionsText.split('\n').filter(Boolean);
    nextQuestions = cleanUpFollowUp(nextQuestions);
  }

  // Remove the 'steps', 'citation' and 'next questions' portions of the response
  // from the response answer
  const stepsIndex = replacedText.indexOf('steps:');
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
