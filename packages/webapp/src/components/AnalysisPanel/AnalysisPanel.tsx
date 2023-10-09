import { Pivot, PivotItem } from '@fluentui/react';
import DOMPurify from 'dompurify';

import styles from './AnalysisPanel.module.css';

import { SupportingContent } from '../SupportingContent/index.js';
import { type Message } from '../../api/index.js';
import { AnalysisPanelTabs } from './AnalysisPanelTabs.jsx';

interface Props {
  className: string;
  activeTab: AnalysisPanelTabs;
  onActiveTabChanged: (tab: AnalysisPanelTabs) => void;
  activeCitation: string | undefined;
  citationHeight: string;
  answer: Message;
}

const pivotItemDisabledStyle = { disabled: true, style: { color: 'grey' } };

export const AnalysisPanel = ({
  answer,
  activeTab,
  activeCitation,
  citationHeight,
  className,
  onActiveTabChanged,
}: Props) => {
  const isDisabledThoughtProcessTab: boolean = !answer.context?.thoughts;
  const isDisabledSupportingContentTab: boolean = answer.context?.data_points?.length === 0;
  const isDisabledCitationTab: boolean = !activeCitation;
  const sanitizedThoughts = DOMPurify.sanitize(answer.context?.thoughts ?? '');

  return (
    <Pivot
      className={className}
      selectedKey={activeTab}
      onLinkClick={(pivotItem) => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
    >
      <PivotItem
        itemKey={AnalysisPanelTabs.ThoughtProcessTab}
        headerText="Thought process"
        headerButtonProps={isDisabledThoughtProcessTab ? pivotItemDisabledStyle : undefined}
      >
        <div className={styles.thoughtProcess} dangerouslySetInnerHTML={{ __html: sanitizedThoughts }}></div>
      </PivotItem>
      {answer.context?.data_points && (
        <PivotItem
          itemKey={AnalysisPanelTabs.SupportingContentTab}
          headerText="Supporting content"
          headerButtonProps={isDisabledSupportingContentTab ? pivotItemDisabledStyle : undefined}
        >
          <SupportingContent supportingContent={answer.context!.data_points!} />
        </PivotItem>
      )}
      <PivotItem
        itemKey={AnalysisPanelTabs.CitationTab}
        headerText="Citation"
        headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
      >
        <iframe title="Citation" src={activeCitation} width="100%" height={citationHeight} />
      </PivotItem>
    </Pivot>
  );
};
