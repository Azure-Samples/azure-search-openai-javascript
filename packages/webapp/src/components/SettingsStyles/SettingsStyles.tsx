import React, { useState, useEffect } from 'react';
import type { CustomStylesState } from '../../api/models.js';
import './SettingsStyles.css';

/* type CustomStylesState = {
  AccentHigh: string;
  AccentLight: string;
  AccentDark: string;
  TextColor: string;
  BackgroundColor: string;
  FormBackgroundColor: string;
  BorderRadius: number;
  BorderWidth: number;
  FontBaseSize: number;
}; */

interface Props {
  onChange: (newStyles: CustomStylesState) => void;
}

export const SettingsStyles = ({ onChange }: Props) => {
  // this needs to come from an API call to some config persisted in the DB
  const styleDefaults = {
    AccentHighDefault: '#692b61',
    AccentLightDefault: '#f6d5f2',
    AccentDarkDefault: '#5e3c7d',
    TextColorDefault: '#123f58',
    BackgroundColorDefault: '#e3e3e3',
    FormBackgroundColorDefault: '#f5f5f5',
    BorderRadiusDefault: '10px',
    BorderWidthDefault: '3px',
    FontBaseSizeDefault: '14px',
  };

  const getInitialStyles = (): CustomStylesState => {
    const storedStyles = localStorage.getItem('customStyles');
    return storedStyles
      ? JSON.parse(storedStyles)
      : {
          AccentHigh: styleDefaults.AccentHighDefault,
          AccentLight: styleDefaults.AccentLightDefault,
          AccentDark: styleDefaults.AccentDarkDefault,
          TextColor: styleDefaults.TextColorDefault,
          BackgroundColor: styleDefaults.BackgroundColorDefault,
          FormBackgroundColor: styleDefaults.FormBackgroundColorDefault,
          BorderRadius: styleDefaults.BorderRadiusDefault,
          BorderWidth: styleDefaults.BorderWidthDefault,
          FontBaseSize: styleDefaults.FontBaseSizeDefault,
        };
  };

  const [customStyles, setStyles] = useState<CustomStylesState>(getInitialStyles);

  useEffect(() => {
    // Update the parent component when the state changes
    onChange(customStyles);
  }, [customStyles, onChange]);

  const handleInputChange = (key: keyof CustomStylesState, value: string | number) => {
    setStyles((previousStyles) => ({
      ...previousStyles,
      [key]: value,
    }));
  };

  return (
    <>
      <h3>Modify Styles</h3>
      <div className="ms-style-picker colors">
        {[
          { label: 'Accent High', name: 'AccentHigh', placeholder: 'Accent high' },
          { label: 'Accent Lighter', name: 'AccentLighter', placeholder: 'Accent lighter' },
          { label: 'Accent Contrast', name: 'AccentContrast', placeholder: 'Accent contrast' },
          { label: 'Text Color', name: 'TextColor', placeholder: 'Text color' },
          { label: 'Background Color', name: 'BackgroundColor', placeholder: 'Background color' },
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
                placeholder={`Slider for ${slider.name.toLowerCase()}`}
                value={customStyles[slider.name as keyof CustomStylesState]}
                onChange={(event) =>
                  handleInputChange(slider.name as keyof CustomStylesState, `${event.target.value}px`)
                }
              />
              <span className="ms-setting-value">{customStyles[slider.name as keyof CustomStylesState]}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};
