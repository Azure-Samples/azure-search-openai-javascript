import { HTMLTemplateResult, html, nothing } from 'lit';

export type ParsedMessage = {
  html: HTMLTemplateResult;
  citations: string[];
  followupQuestions: string[];
};

export function parseMessageIntoHtml(
  message: string,
  renderCitationReference: (citation: string, index: number) => HTMLTemplateResult,
): ParsedMessage {
  const citations: string[] = [];
  const followupQuestions: string[] = [];

  // Extract any follow-up questions that might be in the message
  let text = message
    .replaceAll(/<<([^>>]+)>>/g, (_match, content) => {
      followupQuestions.push(content);
      return '';
    })
    .split('<<')[0] // Truncate incomplete questions
    .trim();

  // Extract any citations that might be in the message
  const parts = text.split(/\[([^\]]+)\]/g);
  const result = html`${parts.map((part, index) => {
    if (index % 2 === 0) {
      return html`${part}`;
    } else if (index + 1 < parts.length) {
      let citationIndex = citations.indexOf(part);
      if (citationIndex !== -1) {
        citationIndex++;
      } else {
        citations.push(part);
        citationIndex = citations.length;
      }
      return renderCitationReference(part, citationIndex);
    } else {
      return nothing;
    }
  })}`;

  return {
    html: result,
    citations,
    followupQuestions,
  };
}
