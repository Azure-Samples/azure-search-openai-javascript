// ThemeSwitch.tsx
import React from 'react';
import { Toggle } from '@fluentui/react';
import { DarkTheme24Regular } from '@fluentui/react-icons'; // Replace with your actual icon components
import './ThemeSwitch.css';

interface ThemeSwitchProps {
  onToggle: () => void;
  isDarkTheme: boolean;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ onToggle, isDarkTheme }) => {
  return (
    <div className="ms-toggle-wrapper">
      <DarkTheme24Regular />
      <Toggle label="" onText="Dark Theme" offText="Light Theme" checked={isDarkTheme} onChange={onToggle} />
    </div>
  );
};
