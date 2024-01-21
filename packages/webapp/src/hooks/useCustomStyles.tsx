import { useState, useEffect } from 'react';

export type CustomStylesState = {
  AccentHigh: string;
  AccentLight: string;
  AccentDark: string;
  TextColor: string;
  BackgroundColor: string;
  FormBackgroundColor: string;
  BorderRadius: string;
  BorderWidth: string;
  FontBaseSize: string;
};

const useCustomStyles = (isDarkTheme: boolean) => {
  const styleDefaultsLight = {
    AccentHigh: '#692b61',
    AccentLight: '#f6d5f2',
    AccentDark: '#5e3c7d',
    TextColor: '#123f58',
    BackgroundColor: '#e3e3e3',
    ForegroundColor: '#4e5288',
    FormBackgroundColor: '#f5f5f5',
    BorderRadius: '10px',
    BorderWidth: '3px',
    FontBaseSize: '14px',
  };

  const styleDefaultsDark = {
    AccentHigh: '#dcdef8',
    AccentLight: '#032219',
    AccentDark: '#fdfeff',
    TextColor: '#fdfeff',
    BackgroundColor: '#32343e',
    ForegroundColor: '#4e5288',
    FormBackgroundColor: '#32343e',
    BorderRadius: '10px',
    BorderWidth: '3px',
    FontBaseSize: '14px',
  };

  const defaultStyles = isDarkTheme ? styleDefaultsDark : styleDefaultsLight;

  const [customStyles, setCustomStyles] = useState(() => {
    const storedStyles = localStorage.getItem('ms-azoaicc:customStyles');
    return storedStyles ? JSON.parse(storedStyles) : defaultStyles;
  });

  useEffect(() => {
    localStorage.setItem('ms-azoaicc:customStyles', JSON.stringify(customStyles));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [() => customStyles]);

  const updateCustomStyles = (newStyles: CustomStylesState) => {
    setCustomStyles(newStyles);
  };

  return { customStyles, updateCustomStyles };
};

export default useCustomStyles;
