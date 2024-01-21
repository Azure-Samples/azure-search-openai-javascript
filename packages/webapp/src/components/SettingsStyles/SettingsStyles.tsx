import React, { useEffect } from 'react';
import useCustomStyles, { type CustomStylesState } from '../../hooks/useCustomStyles.js';
import './SettingsStyles.css';

interface Props {
  onChange: (newStyles: CustomStylesState) => void;
}

export const SettingsStyles = ({ onChange }: Props) => {
  const { customStyles, updateCustomStyles } = useCustomStyles(true);

  useEffect(() => {
    // Update the parent component when the state changes
    onChange(customStyles);
  }, [customStyles, onChange]);

  const handleInputChange = (key: keyof CustomStylesState, value: string | number) => {
    const updatedStyles: CustomStylesState = {
      ...customStyles,
      [key]: value,
    };

    return updateCustomStyles(updatedStyles);
  };

  return (
    <>
      <h3>Modify Styles</h3>
      <div className="ms-style-picker colors">
        {[
          { label: 'Accent High', name: 'AccentHigh', placeholder: 'Accent high' },
          { label: 'Accent Light', name: 'AccentLight', placeholder: 'Accent light' },
          { label: 'Accent Dark', name: 'AccentDark', placeholder: 'Accent dark' },
          { label: 'Text Color', name: 'TextColor', placeholder: 'Text color' },
          { label: 'Background Color', name: 'BackgroundColor', placeholder: 'Background color' },
          { label: 'Foreground Color', name: 'ForegroundColor', placeholder: 'Foreground color' },
          { label: 'Form background', name: 'FormBackgroundColor', placeholder: 'Form Background color' },
        ].map((input) => (
          <React.Fragment key={input.name}>
            <label htmlFor={`accent-${input.name.toLowerCase()}-picker`}>{input.label}</label>
            <input
              name={`accent-${input.name.toLowerCase()}-picker`}
              type="color"
              placeholder={input.placeholder}
              value={customStyles[input.name as keyof CustomStylesState]}
              onChange={(event) => handleInputChange(input.name as keyof CustomStylesState, event.target.value)}
              title={input.label}
            />
          </React.Fragment>
        ))}
      </div>
      <div className="ms-style-picker sliders">
        {/* Sliders */}
        {[
          { label: 'Border Radius', name: 'BorderRadius', min: 0, max: 25 },
          { label: 'Border Width', name: 'BorderWidth', min: 1, max: 5 },
          { label: 'Font Base Size', name: 'FontBaseSize', min: 12, max: 20 },
        ].map((slider) => (
          <React.Fragment key={slider.name}>
            <div className="ms-settings-input-slider">
              <label htmlFor={`slider-${slider.name.toLowerCase()}`}>{slider.label}</label>
              <input
                name={`slider-${slider.name.toLowerCase()}`}
                type="range"
                min={slider.min}
                max={slider.max}
                value={customStyles[slider.name as keyof CustomStylesState]}
                onChange={(event) => handleInputChange(slider.name as keyof CustomStylesState, event.target.value)}
                title={slider.label}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};
