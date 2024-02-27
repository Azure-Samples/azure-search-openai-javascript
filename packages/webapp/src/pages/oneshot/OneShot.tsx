import {
  Checkbox,
  ChoiceGroup,
  DefaultButton,
  Dropdown,
  Panel,
  SpinButton,
  TextField,
  TooltipHost,
  type IChoiceGroupOption,
  type IDropdownOption,
} from '@fluentui/react';
import { useState } from 'react';

import styles from './OneShot.module.css';

import { Approaches, RetrievalMode, apiBaseUrl, type RequestOverrides } from '../../api/index.js';
import { SettingsButton } from '../../components/SettingsButton/SettingsButton.jsx';

import 'chat-component';
import { toolTipText, toolTipTextCalloutProps } from '../../i18n/tooltips.js';

export function Component(): JSX.Element {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [approach, setApproach] = useState<Approaches>(Approaches.ReadRetrieveRead);
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [promptTemplatePrefix, setPromptTemplatePrefix] = useState<string>('');
  const [promptTemplateSuffix, setPromptTemplateSuffix] = useState<string>('');
  const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
  const [retrieveCount, setRetrieveCount] = useState<number>(3);
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
  const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
  const [excludeCategory, setExcludeCategory] = useState<string>('');

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

  const approaches: IChoiceGroupOption[] = [
    {
      key: Approaches.RetrieveThenRead,
      text: 'Retrieve-Then-Read',
    },
    {
      key: Approaches.ReadRetrieveRead,
      text: 'Read-Retrieve-Read',
    },
  ];

  const overrides: RequestOverrides = {
    retrieval_mode: retrievalMode,
    top: retrieveCount,
    semantic_ranker: useSemanticRanker,
    semantic_captions: useSemanticCaptions,
    exclude_category: excludeCategory,
    prompt_template: promptTemplate,
    prompt_template_prefix: promptTemplatePrefix,
    prompt_template_suffix: promptTemplateSuffix,
  };

  return (
    <div className={styles.oneshotContainer}>
      <div className={styles.oneshotTopSection}>
        <SettingsButton className={styles.settingsButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
        <chat-component
          title="Ask your data"
          data-input-position="sticky"
          data-interaction-model="ask"
          data-api-url={apiBaseUrl}
          data-use-stream="false"
          data-approach={approach}
          data-overrides={JSON.stringify(overrides)}
        ></chat-component>
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
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.approaches}>
          <ChoiceGroup
            className={styles.oneshotSettingsSeparator}
            label="Approach"
            options={approaches}
            defaultSelectedKey={approach}
            onChange={onApproachChange}
          />
        </TooltipHost>

        {(approach === Approaches.RetrieveThenRead || approach === Approaches.ReadDecomposeAsk) && (
          <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.promptTemplate}>
            <TextField
              className={styles.oneshotSettingsSeparator}
              defaultValue={promptTemplate}
              label="Override prompt template"
              multiline
              autoAdjustHeight
              onChange={onPromptTemplateChange}
            />
          </TooltipHost>
        )}

        {approach === Approaches.ReadRetrieveRead && (
          <>
            <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.promptTemplatePrefix}>
              <TextField
                className={styles.oneshotSettingsSeparator}
                defaultValue={promptTemplatePrefix}
                label="Override prompt prefix template"
                multiline
                autoAdjustHeight
                onChange={onPromptTemplatePrefixChange}
              />
            </TooltipHost>
            <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.promptTemplateSuffix}>
              <TextField
                className={styles.oneshotSettingsSeparator}
                defaultValue={promptTemplateSuffix}
                label="Override prompt suffix template"
                multiline
                autoAdjustHeight
                onChange={onPromptTemplateSuffixChange}
              />
            </TooltipHost>
          </>
        )}
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.retrieveNumber}>
          <SpinButton
            className={styles.oneshotSettingsSeparator}
            label="Retrieve this many search results:"
            min={1}
            max={50}
            defaultValue={retrieveCount.toString()}
            onChange={onRetrieveCountChange}
          />
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.excludeCategory}>
          <TextField
            className={styles.oneshotSettingsSeparator}
            label="Exclude category"
            onChange={onExcludeCategoryChanged}
          />
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.useSemanticRanker}>
          <Checkbox
            className={styles.oneshotSettingsSeparator}
            checked={useSemanticRanker}
            label="Use semantic ranker for retrieval"
            onChange={onUseSemanticRankerChange}
          />
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.useQueryContextSummaries}>
          <Checkbox
            className={styles.oneshotSettingsSeparator}
            checked={useSemanticCaptions}
            label="Use query-contextual summaries instead of whole documents"
            onChange={onUseSemanticCaptionsChange}
            disabled={!useSemanticRanker}
          />
        </TooltipHost>
        <TooltipHost calloutProps={toolTipTextCalloutProps} content={toolTipText.retrievalMode}>
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
        </TooltipHost>
      </Panel>
    </div>
  );
}

Component.displayName = 'OneShot';
