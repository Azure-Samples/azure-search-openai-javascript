import { useRef, useState } from 'react';
import {
  Checkbox,
  ChoiceGroup,
  type IChoiceGroupOption,
  Panel,
  DefaultButton,
  Spinner,
  TextField,
  SpinButton,
  type IDropdownOption,
  Dropdown,
} from '@fluentui/react';

import styles from './OneShot.module.css';

import { askApi, Approaches, type AskResponse, type AskRequest, RetrievalMode } from '../../api/index.js';
import { Answer, AnswerError } from '../../components/Answer/index.js';
import { QuestionInput } from '../../components/QuestionInput/index.js';
import { ExampleList } from '../../components/Example/index.js';
import { AnalysisPanel, AnalysisPanelTabs } from '../../components/AnalysisPanel/index.js';
import { SettingsButton } from '../../components/SettingsButton/SettingsButton.jsx';

export function Component(): JSX.Element {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [approach, setApproach] = useState<Approaches>(Approaches.RetrieveThenRead);
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [promptTemplatePrefix, setPromptTemplatePrefix] = useState<string>('');
  const [promptTemplateSuffix, setPromptTemplateSuffix] = useState<string>('');
  const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
  const [retrieveCount, setRetrieveCount] = useState<number>(3);
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
  const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
  const [excludeCategory, setExcludeCategory] = useState<string>('');

  const lastQuestionReference = useRef<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>();
  const [answer, setAnswer] = useState<AskResponse>();

  const [activeCitation, setActiveCitation] = useState<string>();
  const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

  const makeApiRequest = async (question: string) => {
    lastQuestionReference.current = question;

    error && setError(undefined);
    setIsLoading(true);
    setActiveCitation(undefined);
    setActiveAnalysisPanelTab(undefined);

    try {
      const request: AskRequest = {
        question,
        approach,
        overrides: {
          promptTemplate: promptTemplate.length === 0 ? undefined : promptTemplate,
          promptTemplatePrefix: promptTemplatePrefix.length === 0 ? undefined : promptTemplatePrefix,
          promptTemplateSuffix: promptTemplateSuffix.length === 0 ? undefined : promptTemplateSuffix,
          excludeCategory: excludeCategory.length === 0 ? undefined : excludeCategory,
          top: retrieveCount,
          retrievalMode: retrievalMode,
          semanticRanker: useSemanticRanker,
          semanticCaptions: useSemanticCaptions,
        },
      };
      const result = await askApi(request);
      setAnswer(result);
    } catch (error_) {
      setError(error_);
    } finally {
      setIsLoading(false);
    }
  };

  const onPromptTemplateChange = (
    _event?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string,
  ) => {
    setPromptTemplate(newValue || '');
  };

  const onPromptTemplatePrefixChange = (
    _event?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string,
  ) => {
    setPromptTemplatePrefix(newValue || '');
  };

  const onPromptTemplateSuffixChange = (
    _event?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string,
  ) => {
    setPromptTemplateSuffix(newValue || '');
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

  const onApproachChange = (_event?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
    setApproach((option?.key as Approaches) || Approaches.RetrieveThenRead);
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

  const onExampleClicked = (example: string) => {
    makeApiRequest(example);
  };

  const onShowCitation = (citation: string) => {
    if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab) {
      setActiveAnalysisPanelTab(undefined);
    } else {
      setActiveCitation(citation);
      setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
    }
  };

  const onToggleTab = (tab: AnalysisPanelTabs) => {
    if (activeAnalysisPanelTab === tab) {
      setActiveAnalysisPanelTab(undefined);
    } else {
      setActiveAnalysisPanelTab(tab);
    }
  };

  const approaches: IChoiceGroupOption[] = [
    {
      key: Approaches.RetrieveThenRead,
      text: 'Retrieve-Then-Read',
    },
    {
      key: Approaches.ReadRetrieveRead,
      text: 'Read-Retrieve-Read',
    },
    {
      key: Approaches.ReadDecomposeAsk,
      text: 'Read-Decompose-Ask',
    },
  ];

  return (
    <div className={styles.oneshotContainer}>
      <div className={styles.oneshotTopSection}>
        <SettingsButton className={styles.settingsButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
        <h1 className={styles.oneshotTitle}>Ask your data</h1>
        <div className={styles.oneshotQuestionInput}>
          <QuestionInput
            placeholder="Example: Does my plan cover annual eye exams?"
            disabled={isLoading}
            onSend={(question) => makeApiRequest(question)}
          />
        </div>
      </div>
      <div className={styles.oneshotBottomSection}>
        {isLoading && <Spinner label="Generating answer" />}
        {!lastQuestionReference.current && <ExampleList onExampleClicked={onExampleClicked} />}
        {!isLoading && answer && !error && (
          <div className={styles.oneshotAnswerContainer}>
            <Answer
              answer={answer}
              onCitationClicked={(x) => onShowCitation(x)}
              onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab)}
              onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab)}
            />
          </div>
        )}
        {error ? (
          <div className={styles.oneshotAnswerContainer}>
            <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionReference.current)} />
          </div>
        ) : undefined}
        {activeAnalysisPanelTab && answer && (
          <AnalysisPanel
            className={styles.oneshotAnalysisPanel}
            activeCitation={activeCitation}
            onActiveTabChanged={(x) => onToggleTab(x)}
            citationHeight="600px"
            answer={answer}
            activeTab={activeAnalysisPanelTab}
          />
        )}
      </div>

      <Panel
        headerText="Configure answer generation"
        isOpen={isConfigPanelOpen}
        isBlocking={false}
        onDismiss={() => setIsConfigPanelOpen(false)}
        closeButtonAriaLabel="Close"
        onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
        isFooterAtBottom={true}
      >
        <ChoiceGroup
          className={styles.oneshotSettingsSeparator}
          label="Approach"
          options={approaches}
          defaultSelectedKey={approach}
          onChange={onApproachChange}
        />

        {(approach === Approaches.RetrieveThenRead || approach === Approaches.ReadDecomposeAsk) && (
          <TextField
            className={styles.oneshotSettingsSeparator}
            defaultValue={promptTemplate}
            label="Override prompt template"
            multiline
            autoAdjustHeight
            onChange={onPromptTemplateChange}
          />
        )}

        {approach === Approaches.ReadRetrieveRead && (
          <>
            <TextField
              className={styles.oneshotSettingsSeparator}
              defaultValue={promptTemplatePrefix}
              label="Override prompt prefix template"
              multiline
              autoAdjustHeight
              onChange={onPromptTemplatePrefixChange}
            />
            <TextField
              className={styles.oneshotSettingsSeparator}
              defaultValue={promptTemplateSuffix}
              label="Override prompt suffix template"
              multiline
              autoAdjustHeight
              onChange={onPromptTemplateSuffixChange}
            />
          </>
        )}

        <SpinButton
          className={styles.oneshotSettingsSeparator}
          label="Retrieve this many documents from search:"
          min={1}
          max={50}
          defaultValue={retrieveCount.toString()}
          onChange={onRetrieveCountChange}
        />
        <TextField
          className={styles.oneshotSettingsSeparator}
          label="Exclude category"
          onChange={onExcludeCategoryChanged}
        />
        <Checkbox
          className={styles.oneshotSettingsSeparator}
          checked={useSemanticRanker}
          label="Use semantic ranker for retrieval"
          onChange={onUseSemanticRankerChange}
        />
        <Checkbox
          className={styles.oneshotSettingsSeparator}
          checked={useSemanticCaptions}
          label="Use query-contextual summaries instead of whole documents"
          onChange={onUseSemanticCaptionsChange}
          disabled={!useSemanticRanker}
        />
        <Dropdown
          className={styles.oneshotSettingsSeparator}
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
  );
}

Component.displayName = 'OneShot';
