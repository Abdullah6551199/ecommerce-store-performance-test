'use client';

import React from 'react';
import { TypographySettings, BreakpointDevice } from '../../shared/types';
import { ColorControl } from './ColorControl';
import { ResponsiveControl } from './ResponsiveControl';

interface TypographyControlProps {
  value?: TypographySettings;
  onChange: (val: TypographySettings) => void;
  currentDevice?: BreakpointDevice;
  onDeviceChange?: (device: BreakpointDevice) => void;
}

const CURATED_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Bebas Neue',
  'Oswald',
  'Cinzel',
  'Plus Jakarta Sans',
  'Outfit',
  'Space Grotesk',
  'Syne',
  'DM Sans',
  'Lora',
  'Fira Code',
  'JetBrains Mono',
  'Caveat',
  'Dancing Script',
];

const FONT_WEIGHTS = [
  { label: '100 - Thin', value: '100' },
  { label: '200 - Extra Light', value: '200' },
  { label: '300 - Light', value: '300' },
  { label: '400 - Normal', value: '400' },
  { label: '500 - Medium', value: '500' },
  { label: '600 - Semi Bold', value: '600' },
  { label: '700 - Bold', value: '700' },
  { label: '800 - Extra Bold', value: '800' },
  { label: '900 - Black', value: '900' },
];

export function TypographyControl({
  value = {},
  onChange,
  currentDevice = 'desktop',
  onDeviceChange,
}: TypographyControlProps) {
  const currentFontSize = value.fontSize?.[currentDevice] || '';

  const handleFontSizeChange = (val: string) => {
    onChange({
      ...value,
      fontSize: {
        ...(value.fontSize || {}),
        [currentDevice]: val,
      },
    });
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50/70 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between pb-1 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Typography</span>
        {onDeviceChange && (
          <ResponsiveControl currentDevice={currentDevice} onDeviceChange={onDeviceChange} />
        )}
      </div>

      {/* Font Family */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Font Family</label>
        <select
          value={value.fontFamily || ''}
          onChange={(e) => onChange({ ...value, fontFamily: e.target.value })}
          className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Default Theme Font</option>
          {CURATED_FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size (Responsive) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">
            Font Size ({currentDevice})
          </label>
          <span className="text-[10px] text-gray-600 font-mono">e.g. 16px, 1.25rem</span>
        </div>
        <input
          type="text"
          value={currentFontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          placeholder={currentDevice === 'mobile' ? '14px' : '16px'}
          className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Weight</label>
        <select
          value={value.fontWeight || ''}
          onChange={(e) => onChange({ ...value, fontWeight: e.target.value })}
          className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Default</option>
          {FONT_WEIGHTS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {/* Transform & Style */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Transform</label>
          <select
            value={value.textTransform || 'none'}
            onChange={(e) => onChange({ ...value, textTransform: e.target.value as any })}
            className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5"
          >
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Style</label>
          <select
            value={value.fontStyle || 'normal'}
            onChange={(e) => onChange({ ...value, fontStyle: e.target.value as any })}
            className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
            <option value="oblique">Oblique</option>
          </select>
        </div>
      </div>

      {/* Line Height & Letter Spacing */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Line Height</label>
          <input
            type="text"
            value={value.lineHeight || ''}
            onChange={(e) => onChange({ ...value, lineHeight: e.target.value })}
            placeholder="1.5"
            className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Letter Spacing</label>
          <input
            type="text"
            value={value.letterSpacing || ''}
            onChange={(e) => onChange({ ...value, letterSpacing: e.target.value })}
            placeholder="-0.02em"
            className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5"
          />
        </div>
      </div>

      {/* Text Color */}
      <ColorControl
        label="Text Color"
        value={value.color}
        onChange={(color) => onChange({ ...value, color })}
        onReset={() => onChange({ ...value, color: undefined })}
      />
    </div>
  );
}
