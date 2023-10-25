import { Text } from '@fluentui/react';
import { Settings24Regular } from '@fluentui/react-icons';

import styles from './SettingsButton.module.css';

interface Props {
  className?: string;
  onClick: () => void;
}

export const SettingsButton = ({ className, onClick }: Props) => {
  return (
    <button
      className={`${styles.container} ${className ?? ''}`}
      onClick={onClick}
      data-testid="button__developer-settings"
    >
      <Settings24Regular />
      <Text>{'Developer settings'}</Text>
    </button>
  );
};
