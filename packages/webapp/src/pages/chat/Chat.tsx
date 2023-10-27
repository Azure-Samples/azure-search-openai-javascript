import { useLayoutEffect, useRef, useState } from 'react';
import styles from './Chat.module.css';
import { RetrievalMode, apiBaseUrl } from '../../api/index.js';
import { SettingsButton } from '../../components/SettingsButton/index.js';
import { Checkbox, DefaultButton, Dropdown, Panel, SpinButton, TextField } from '@fluentui/react';
import type { IDropdownOption } from '@fluentui/react/lib-commonjs/Dropdown';
import 'chat-component';
import { ClearChatButton } from '../../components/ClearChatButton/index.js';
import { type ChatComponentOptions, type ChatComponent, defaultOptions, type ChatMessage } from '@azure/chat';

const baseChatOption: ChatComponentOptions = {
  ...defaultOptions,
  apiUrl: apiBaseUrl,
};

const Chat = () => {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [retrieveCount, setRetrieveCount] = useState<number>(3);
  const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
  const [useStream, setUseStream] = useState<boolean>(true);
  const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
  const [, setExcludeCategory] = useState<string>('');
  const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatOptions, setChatOptions] = useState<ChatComponentOptions>(baseChatOption);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const chatElement = useRef<ChatComponent>();

  const onPromptTemplateChange = (
    _event?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string = '',
  ) => {
    setPromptTemplate(newValue);
    setChatOptions({ ...chatOptions, promptTemplate: newValue });
  };

  const onRetrieveCountChange = (_event?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
    const value = Number.parseInt(newValue || '3');
    setRetrieveCount(value);
    setChatOptions({ ...chatOptions, top: value });
  };

  const onRetrievalModeChange = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption<RetrievalMode> | undefined,
    _index?: number | undefined,
  ) => {
    const value = option?.data || RetrievalMode.Hybrid;
    setRetrievalMode(value);
    setChatOptions({ ...chatOptions, retrievalMode: value });
  };

  const onUseSemanticRankerChange = (_event?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    const value = !!checked;
    setUseSemanticRanker(value);
    setChatOptions({ ...chatOptions, semanticRanker: value });
  };

  const onUseSemanticCaptionsChange = (_event?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    const value = !!checked;
    setUseSemanticCaptions(value);
    setChatOptions({ ...chatOptions, semanticCaptions: value });
  };

  const onUseStreamChange = (_event?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    const value = !!checked;
    setUseStream(value);
    setChatOptions({ ...chatOptions, stream: value });
  };

  const onExcludeCategoryChanged = (_event?: React.FormEvent, newValue: string = '') => {
    setExcludeCategory(newValue);
    setChatOptions({ ...chatOptions, excludeCategory: newValue });
  };

  const onUseSuggestFollowupQuestionsChange = (
    _event?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean,
  ) => {
    const value = !!checked;
    setUseSuggestFollowupQuestions(value);
    setChatOptions({ ...chatOptions, suggestFollowupQuestions: value });
  };

  const onMessagesUpdated = (event: Event) => {
    const customEvent = event as CustomEvent;
    setMessages(customEvent.detail.messages);
  };

  const onStateChanged = (event: Event) => {
    const customEvent = event as CustomEvent;
    setIsLoading(customEvent.detail.state.isLoading);
  };

  const clearChat = () => {
    setMessages([]);
  };

  useLayoutEffect(() => {
    // Register event handlers for web component
    const { current } = chatElement;
    current?.addEventListener('messagesUpdated', onMessagesUpdated);
    current?.addEventListener('stateChanged', onStateChanged);

    return () => {
      current?.removeEventListener('messagesUpdated', onStateChanged);
      current?.removeEventListener('stateChanged', onStateChanged);
    };
  }, [chatElement]);

  return (
    <div className={styles.container}>
      <div className={styles.commandsContainer}>
        <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={isLoading} />
        <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
      </div>
      <div className={styles.chatRoot}>
        <azc-chat
          class={styles.chatComponent}
          ref={chatElement}
          options={JSON.stringify(chatOptions) as any}
          messages={JSON.stringify(messages) as any}
        ></azc-chat>
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
          label="Retrieve this many search results:"
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
        <Checkbox
          className={styles.chatSettingsSeparator}
          checked={useStream}
          label="Stream chat completion responses"
          onChange={onUseStreamChange}
        />
      </Panel>
    </div>
  );
};

export default Chat;
