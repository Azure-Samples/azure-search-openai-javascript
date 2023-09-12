import { useRef, useState, useEffect } from 'react';
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, Dropdown, type IDropdownOption } from '@fluentui/react';
import { SparkleFilled } from '@fluentui/react-icons';

import styles from './Chat.module.css';

import {
  chatApi,
  RetrievalMode,
  Approaches,
  type AskResponse,
  type ChatRequest,
  type ChatTurn,
} from '../../api/index.js';
import { Answer, AnswerError, AnswerLoading } from '../../components/Answer/index.js';
import { QuestionInput } from '../../components/QuestionInput/index.js';
import { ExampleList } from '../../components/Example/index.js';
import { UserChatMessage } from '../../components/UserChatMessage/index.js';
import { AnalysisPanel, AnalysisPanelTabs } from '../../components/AnalysisPanel/index.js';
import { SettingsButton } from '../../components/SettingsButton/index.js';
import { ClearChatButton } from '../../components/ClearChatButton/index.js';

const Chat = () => {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [retrieveCount, setRetrieveCount] = useState<number>(3);
  const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
  const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
  const [excludeCategory, setExcludeCategory] = useState<string>('');
  const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);

  const lastQuestionReference = useRef<string>('');
  const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>();

  const [activeCitation, setActiveCitation] = useState<string>();
  const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

  const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
  const [answers, setAnswers] = useState<[user: string, response: AskResponse][]>([]);

  const makeApiRequest = async (question: string) => {
    lastQuestionReference.current = question;

    error && setError(undefined);
    setIsLoading(true);
    setActiveCitation(undefined);
    setActiveAnalysisPanelTab(undefined);

    try {
      const history: ChatTurn[] = answers.map((a) => ({ user: a[0], bot: a[1].answer }));
      const request: ChatRequest = {
        history: [...history, { user: question, bot: undefined }],
        approach: Approaches.ReadRetrieveRead,
        overrides: {
          promptTemplate: promptTemplate.length === 0 ? undefined : promptTemplate,
          excludeCategory: excludeCategory.length === 0 ? undefined : excludeCategory,
          top: retrieveCount,
          retrievalMode: retrievalMode,
          semanticRanker: useSemanticRanker,
          semanticCaptions: useSemanticCaptions,
          suggestFollowupQuestions: useSuggestFollowupQuestions,
        },
      };
      const result = await chatApi(request);
      setAnswers([...answers, [question, result]]);
    } catch (error_) {
      setError(error_);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    lastQuestionReference.current = '';
    error && setError(undefined);
    setActiveCitation(undefined);
    setActiveAnalysisPanelTab(undefined);
    setAnswers([]);
  };

  useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: 'smooth' }), [isLoading]);

  const onPromptTemplateChange = (
    _event?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string,
  ) => {
    setPromptTemplate(newValue || '');
  };

  const onRetrieveCountChange = (_event?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
    setRetrieveCount(Number.parseInt(newValue || '3'));
  };

  const onRetrievalModeChange = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption<RetrievalMode> | undefined,
    _index?: number | undefined,
  ) => {
    setRetrievalMode(option?.data || RetrievalMode.Hybrid);
  };

  const onUseSemanticRankerChange = (_event?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    setUseSemanticRanker(!!checked);
  };

  const onUseSemanticCaptionsChange = (_event?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    setUseSemanticCaptions(!!checked);
  };

  const onExcludeCategoryChanged = (_event?: React.FormEvent, newValue?: string) => {
    setExcludeCategory(newValue || '');
  };

  const onUseSuggestFollowupQuestionsChange = (
    _event?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean,
  ) => {
    setUseSuggestFollowupQuestions(!!checked);
  };

  const onExampleClicked = (example: string) => {
    makeApiRequest(example);
  };

  const onShowCitation = (citation: string, index: number) => {
    if (
      activeCitation === citation &&
      activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab &&
      selectedAnswer === index
    ) {
      setActiveAnalysisPanelTab(undefined);
    } else {
      setActiveCitation(citation);
      setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
    }

    setSelectedAnswer(index);
  };

  const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
    if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
      setActiveAnalysisPanelTab(undefined);
    } else {
      setActiveAnalysisPanelTab(tab);
    }

    setSelectedAnswer(index);
  };

  return (
    <div className={styles.container}>
      <div className={styles.commandsContainer}>
        <ClearChatButton
          className={styles.commandButton}
          onClick={clearChat}
          disabled={!lastQuestionReference.current || isLoading}
        />
        <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
      </div>
      <div className={styles.chatRoot}>
        <div className={styles.chatContainer}>
          {lastQuestionReference.current ? (
            <div className={styles.chatMessageStream}>
              {answers.map((answer, index) => (
                <div key={index}>
                  <UserChatMessage message={answer[0]} />
                  <div className={styles.chatMessageGpt}>
                    <Answer
                      key={index}
                      answer={answer[1]}
                      isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                      onCitationClicked={(c) => onShowCitation(c, index)}
                      onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                      onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                      onFollowupQuestionClicked={(q) => makeApiRequest(q)}
                      showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <>
                  <UserChatMessage message={lastQuestionReference.current} />
                  <div className={styles.chatMessageGptMinWidth}>
                    <AnswerLoading />
                  </div>
                </>
              )}
              {error ? (
                <>
                  <UserChatMessage message={lastQuestionReference.current} />
                  <div className={styles.chatMessageGptMinWidth}>
                    <AnswerError
                      error={error.toString()}
                      onRetry={() => makeApiRequest(lastQuestionReference.current)}
                    />
                  </div>
                </>
              ) : undefined}
              <div ref={chatMessageStreamEnd} />
            </div>
          ) : (
            <div className={styles.chatEmptyState}>
              <SparkleFilled
                fontSize={'120px'}
                primaryFill={'rgba(115, 118, 225, 1)'}
                aria-hidden="true"
                aria-label="Chat logo"
              />
              <h1 className={styles.chatEmptyStateTitle}>Chat with your data</h1>
              <h2 className={styles.chatEmptyStateSubtitle}>Ask anything or try an example</h2>
              <ExampleList onExampleClicked={onExampleClicked} />
            </div>
          )}

          <div className={styles.chatInput}>
            <QuestionInput
              clearOnSend
              placeholder="Type a new question (e.g. does my plan cover annual eye exams?)"
              disabled={isLoading}
              onSend={(question) => makeApiRequest(question)}
            />
          </div>
        </div>

        {answers.length > 0 && activeAnalysisPanelTab && (
          <AnalysisPanel
            className={styles.chatAnalysisPanel}
            activeCitation={activeCitation}
            onActiveTabChanged={(x) => onToggleTab(x, selectedAnswer)}
            citationHeight="810px"
            answer={answers[selectedAnswer][1]}
            activeTab={activeAnalysisPanelTab}
          />
        )}

        <Panel
          headerText="Configure answer generation"
          isOpen={isConfigPanelOpen}
          isBlocking={false}
          onDismiss={() => setIsConfigPanelOpen(false)}
          closeButtonAriaLabel="Close"
          onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
          isFooterAtBottom={true}
        >
          <TextField
            className={styles.chatSettingsSeparator}
            defaultValue={promptTemplate}
            label="Override prompt template"
            multiline
            autoAdjustHeight
            onChange={onPromptTemplateChange}
          />

          <SpinButton
            className={styles.chatSettingsSeparator}
            label="Retrieve this many documents from search:"
            min={1}
            max={50}
            defaultValue={retrieveCount.toString()}
            onChange={onRetrieveCountChange}
          />
          <TextField
            className={styles.chatSettingsSeparator}
            label="Exclude category"
            onChange={onExcludeCategoryChanged}
          />
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useSemanticRanker}
            label="Use semantic ranker for retrieval"
            onChange={onUseSemanticRankerChange}
          />
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useSemanticCaptions}
            label="Use query-contextual summaries instead of whole documents"
            onChange={onUseSemanticCaptionsChange}
            disabled={!useSemanticRanker}
          />
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useSuggestFollowupQuestions}
            label="Suggest follow-up questions"
            onChange={onUseSuggestFollowupQuestionsChange}
          />
          <Dropdown
            className={styles.chatSettingsSeparator}
            label="Retrieval mode"
            options={[
              {
                key: 'hybrid',
                text: 'Vectors + Text (Hybrid)',
                selected: retrievalMode == RetrievalMode.Hybrid,
                data: RetrievalMode.Hybrid,
              },
              {
                key: 'vectors',
                text: 'Vectors',
                selected: retrievalMode == RetrievalMode.Vectors,
                data: RetrievalMode.Vectors,
              },
              { key: 'text', text: 'Text', selected: retrievalMode == RetrievalMode.Text, data: RetrievalMode.Text },
            ]}
            required
            onChange={onRetrievalModeChange}
          />
        </Panel>
      </div>
    </div>
  );
};

export default Chat;
