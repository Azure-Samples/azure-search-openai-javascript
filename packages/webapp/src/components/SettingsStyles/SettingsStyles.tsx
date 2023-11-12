import React, { useState, useEffect } from 'react';
import './SettingsStyles.css';

type CustomStylesState = {
  AccentHigh: string;
  AccentLighter: string;
  AccentContrast: string;
};

interface Props {
  onChange: (newStyles: CustomStylesState) => void;
}

export const SettingsStyles = ({ onChange }: Props) => {
  const defaultColors = ['#692b61', '#f6d5f2', '#5e3c7d'];

  const getInitialStyles = (): CustomStylesState => {
    const storedStyles = localStorage.getItem('customStyles');
    return storedStyles
      ? JSON.parse(storedStyles)
      : {
          AccentHigh: defaultColors[0],
          AccentLighter: defaultColors[1],
          AccentContrast: defaultColors[2],
        };
  };

  const [customStyles, setStyles] = useState<CustomStylesState>(getInitialStyles);

  useEffect(() => {
    // Update the Chat.txs state when the custom styles change
    onChange(customStyles);
  }, [customStyles, onChange]);

  const handleInputChange = (key: keyof CustomStylesState, value: string) => {
    setStyles((previousStyles) => ({
      ...previousStyles,
      [key]: value,
    }));
  };

  return (
    <>
      <h3>Modify Styles</h3>
      <div className="ms-style-picker">
        {[
          { label: 'Accent High', name: 'AccentHigh', placeholder: 'Accent high' },
          { label: 'Accent Lighter', name: 'AccentLighter', placeholder: 'Accent lighter' },
          { label: 'Accent Contrast', name: 'AccentContrast', placeholder: 'Accent contrast' },
        ].map((input) => (
          <React.Fragment key={input.name}>
            <label htmlFor={`accent-${input.name.toLowerCase()}-picker`}>{input.label}</label>
            <input
              name={`accent-${input.name.toLowerCase()}-picker`}
              type="color"
              placeholder={input.placeholder}
              value={customStyles[input.name as keyof CustomStylesState]}
              onChange={(event) => handleInputChange(input.name as keyof CustomStylesState, event.target.value)}
            />
          </React.Fragment>
        ))}
      </div>
    </>
  );
};
