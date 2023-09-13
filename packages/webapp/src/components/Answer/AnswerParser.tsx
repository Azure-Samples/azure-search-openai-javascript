import { renderToStaticMarkup } from 'react-dom/server';
import { getCitationFilePath } from '../../api/index.js';

type HtmlParsedAnswer = {
  answerHtml: string;
  citations: string[];
  followupQuestions: string[];
};

export function parseAnswerToHtml(
  answer: string,
  onCitationClicked: (citationFilePath: string) => void,
): HtmlParsedAnswer {
  const citations: string[] = [];
  const followupQuestions: string[] = [];

  // Extract any follow-up questions that might be in the answer
  let parsedAnswer = answer.replaceAll(/<<([^>]+)>>/g, (match, content) => {
    followupQuestions.push(content);
    return '';
  });

  // trim any whitespace from the end of the answer after removing follow-up questions
  parsedAnswer = parsedAnswer.trim();

  const parts = parsedAnswer.split(/\[([^\]]+)]/g);

  const fragments: string[] = parts.map((part, index) => {
    if (index % 2 === 0) {
      return part;
    } else {
      let citationIndex: number;
      if (citations.includes(part)) {
        citationIndex = citations.indexOf(part) + 1;
      } else {
        citations.push(part);
        citationIndex = citations.length;
      }

      const path = getCitationFilePath(part);

      return renderToStaticMarkup(
        <button className="supContainer" title={part} onClick={() => onCitationClicked(path)}>
          <sup>{citationIndex}</sup>
        </button>,
      );
    }
  });

  return {
    answerHtml: fragments.join(''),
    citations,
    followupQuestions,
  };
}
