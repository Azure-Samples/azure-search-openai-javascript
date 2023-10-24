import { useEffect, useRef, useState } from 'react';
import styles from './Chat.module.css';
import { RetrievalMode, apiBaseUrl } from '../../api/index.js';
import { SettingsButton } from '../../components/SettingsButton/index.js';
import { Checkbox, DefaultButton, Dropdown, Panel, SpinButton, TextField, TooltipHost } from '@fluentui/react';
import type { IDropdownOption } from '@fluentui/react/lib-commonjs/Dropdown';
import 'chat-component';
import { toolTipText, toolTipTextCalloutProps } from '../../i18n/tooltips.js';

const Chat = () => {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [retrieveCount, setRetrieveCount] = useState<number>(3);
  const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
  const [useStream, setUseStream] = useState<boolean>(true);
  const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
  const [excludeCategory, setExcludeCategory] = useState<string>('');
  const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(true);

  const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

  const [isLoading] = useState<boolean>(false);

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

  const onUseStreamChange = (_event?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    setUseStream(!!checked);
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

  const overrides = {
    retrievalMode,
    top: retrieveCount,
    useSemanticRanker,
    useSemanticCaptions,
    excludeCategory,
    promptTemplate,
    promptTemplatePrefix: '',
    promptTemplateSuffix: '',
    suggestFollowupQuestions: useSuggestFollowupQuestions,
  };

  return (
    <div className={styles.container}>
      <div className={styles.commandsContainer}>
        <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
      </div>
      <div className={styles.chatRoot}>
        <div className={styles.chatEmptyState}>
          <chat-component
            title="Ask anything or try an example"
            data-input-position="sticky"
            data-interaction-model="chat"
            data-api-url={apiBaseUrl}
            data-use-stream={useStream}
            data-approach="rrr"
            data-overrides={JSON.stringify(overrides)}
          ></chat-component>
        </div>
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
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.promptTemplate}>
          <TextField
            className={styles.chatSettingsSeparator}
            defaultValue={promptTemplate}
            label="Override prompt template"
            multiline
            autoAdjustHeight
            onChange={onPromptTemplateChange}
          />
        </TooltipHost>

        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.retrieveNumber}>
          <SpinButton
            className={styles.chatSettingsSeparator}
            label="Retrieve this many search results:"
            min={1}
            max={50}
            defaultValue={retrieveCount.toString()}
            onChange={onRetrieveCountChange}
          />
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.excludeCategory}>
          <TextField
            className={styles.chatSettingsSeparator}
            label="Exclude category"
            onChange={onExcludeCategoryChanged}
          />
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.useSemanticRanker}>
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useSemanticRanker}
            label="Use semantic ranker for retrieval"
            onChange={onUseSemanticRankerChange}
          />
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.useQueryContextSummaries}>
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useSemanticCaptions}
            label="Use query-contextual summaries instead of whole documents"
            onChange={onUseSemanticCaptionsChange}
            disabled={!useSemanticRanker}
          />
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.suggestFollowupQuestions}>
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useSuggestFollowupQuestions}
            label="Suggest follow-up questions"
            onChange={onUseSuggestFollowupQuestionsChange}
          />
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.retrievalMode}>
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
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.streamChat}>
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useStream}
            label="Stream chat completion responses"
            onChange={onUseStreamChange}
          />
        </TooltipHost>
      </Panel>
    </div>
  );
};

export default Chat;
