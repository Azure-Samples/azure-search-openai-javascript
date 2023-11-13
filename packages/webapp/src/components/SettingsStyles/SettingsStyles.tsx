import React, { useState, useEffect } from 'react';
import './SettingsStyles.css';

type CustomStylesState = {
  AccentHigh: string;
  AccentLighter: string;
  AccentContrast: string;
  TextColor: string;
  BackgroundColor: string;
  BorderRadius: number;
  BorderWidth: number;
  FontBaseSize: number;
};

interface Props {
  onChange: (newStyles: CustomStylesState) => void;
}

export const SettingsStyles = ({ onChange }: Props) => {
  const defaultColors = ['#692b61', '#f6d5f2', '#5e3c7d', '#123f58', '#e3e3e3', '#f5f5f5'];
  const defaultDimensions = [25, 3, 14]; // Updated default dimensions to be numbers

  const getInitialStyles = (): CustomStylesState => {
    const storedStyles = localStorage.getItem('customStyles');
    return storedStyles
      ? JSON.parse(storedStyles)
      : {
          AccentHigh: defaultColors[0],
          AccentLighter: defaultColors[1],
          AccentContrast: defaultColors[2],
          TextColor: defaultColors[3],
          BackgroundColor: defaultColors[4],
          FormBackgroundColor: defaultColors[5],
          BorderRadius: defaultDimensions[0],
          BorderWidth: defaultDimensions[1],
          FontBaseSize: defaultDimensions[2],
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
          { label: 'Border Radius', name: 'BorderRadius', min: 0, max: 35 },
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
                  handleInputChange(slider.name as keyof CustomStylesState, Number(event.target.value))
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
