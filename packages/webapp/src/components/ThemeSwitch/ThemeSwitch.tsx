// ThemeSwitch.tsx
import React from 'react';
import { Toggle } from '@fluentui/react';
import './ThemeSwitch.css';

interface ThemeSwitchProps {
  onToggle: (isDarkTheme: boolean) => void;
  isDarkTheme: boolean;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ onToggle, isDarkTheme }) => {
  const handleToggleChange = () => {
    onToggle(!isDarkTheme); // Pass the new theme state to the parent component
  };

  return (
    <>
      <h3>Select the theme</h3>
      <div className="ms-toggle-wrapper">
        <Toggle
          label=""
          onText="Dark Theme"
          offText="Light Theme"
          checked={isDarkTheme}
          onChange={handleToggleChange}
        />
      </div>
    </>
  );
};
