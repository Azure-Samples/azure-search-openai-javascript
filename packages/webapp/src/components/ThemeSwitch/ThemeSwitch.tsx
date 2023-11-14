// ThemeSwitch.tsx
import React, { useEffect } from 'react';
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

  useEffect(() => {
    // Set initial theme based on localStorage
    const storedTheme = localStorage.getItem('isDarkTheme');
    if (storedTheme) {
      const parsedTheme = JSON.parse(storedTheme);
      onToggle(parsedTheme); // Set the initial theme in the parent component
    }
  }, []); // Only run this effect once, when the component mounts

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
