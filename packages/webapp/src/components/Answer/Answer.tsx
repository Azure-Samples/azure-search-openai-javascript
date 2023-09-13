import { useMemo } from 'react';
import { Stack, IconButton } from '@fluentui/react';
import DOMPurify from 'dompurify';

import styles from './Answer.module.css';

import { type AskResponse, getCitationFilePath } from '../../api/index.js';
import { parseAnswerToHtml } from './AnswerParser.jsx';
import { AnswerIcon } from './AnswerIcon.jsx';

interface Props {
  answer: AskResponse;
  isSelected?: boolean;
  onCitationClicked: (filePath: string) => void;
  onThoughtProcessClicked: () => void;
  onSupportingContentClicked: () => void;
  onFollowupQuestionClicked?: (question: string) => void;
  showFollowupQuestions?: boolean;
}

export const Answer = ({
  answer,
  isSelected,
  onCitationClicked,
  onThoughtProcessClicked,
  onSupportingContentClicked,
  onFollowupQuestionClicked,
  showFollowupQuestions,
}: Props) => {
  const parsedAnswer = useMemo(() => parseAnswerToHtml(answer.answer, onCitationClicked), [answer]);

  const sanitizedAnswerHtml = DOMPurify.sanitize(parsedAnswer.answerHtml);

  return (
    <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
      <Stack.Item>
        <Stack horizontal horizontalAlign="space-between">
          <AnswerIcon />
          <div>
            <IconButton
              style={{ color: 'black' }}
              iconProps={{ iconName: 'Lightbulb' }}
              title="Show thought process"
              ariaLabel="Show thought process"
              onClick={() => onThoughtProcessClicked()}
              disabled={!answer.thoughts}
            />
            <IconButton
              style={{ color: 'black' }}
              iconProps={{ iconName: 'ClipboardList' }}
              title="Show supporting content"
              ariaLabel="Show supporting content"
              onClick={() => onSupportingContentClicked()}
              disabled={answer.data_points.length === 0}
            />
          </div>
        </Stack>
      </Stack.Item>

      <Stack.Item grow>
        <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: sanitizedAnswerHtml }}></div>
      </Stack.Item>

      {parsedAnswer.citations.length > 0 && (
        <Stack.Item>
          <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
            <span className={styles.citationLearnMore}>Citations:</span>
            {parsedAnswer.citations.map((x, i) => {
              const path = getCitationFilePath(x);
              return (
                <button key={i} className={styles.citation} title={x} onClick={() => onCitationClicked(path)}>
                  {`${++i}. ${x}`}
                </button>
              );
            })}
          </Stack>
        </Stack.Item>
      )}

      {parsedAnswer.followupQuestions.length > 0 && showFollowupQuestions && onFollowupQuestionClicked && (
        <Stack.Item>
          <Stack
            horizontal
            wrap
            className={`${parsedAnswer.citations.length > 0 ? styles.followupQuestionsList : ''}`}
            tokens={{ childrenGap: 6 }}
          >
            <span className={styles.followupQuestionLearnMore}>Follow-up questions:</span>
            {parsedAnswer.followupQuestions.map((x, i) => {
              return (
                <button
                  key={i}
                  className={styles.followupQuestion}
                  title={x}
                  onClick={() => onFollowupQuestionClicked(x)}
                >
                  {`${x}`}
                </button>
              );
            })}
          </Stack>
        </Stack.Item>
      )}
    </Stack>
  );
};
