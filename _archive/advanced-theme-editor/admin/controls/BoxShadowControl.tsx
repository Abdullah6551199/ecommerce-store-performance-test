'use client';

import React from 'react';
import { BoxShadowSettings } from '../../shared/types';
import { ColorControl } from './ColorControl';

interface BoxShadowControlProps {
  value?: BoxShadowSettings;
  onChange: (val: BoxShadowSettings) => void;
  onReset?: () => void;
}

export function BoxShadowControl({
  value = { x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false },
  onChange,
  onReset,
}: BoxShadowControlProps) {
  const applyPreset = (preset: 'soft' | 'medium' | 'bold' | 'none') => {
    switch (preset) {
      case 'soft':
        onChange({ x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.08)', inset: false });
        break;
      case 'medium':
        onChange({ x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(0,0,0,0.12)', inset: false });
        break;
      case 'bold':
        onChange({ x: 0, y: 12, blur: 32, spread: 0, color: 'rgba(0,0,0,0.18)', inset: false });
        break;
      case 'none':
        onChange({ x: 0, y: 0, blur: 0, spread: 0, color: 'transparent', inset: false });
        break;
    }
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50/70 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between pb-1 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Box Shadow</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-4 gap-1">
        {(['none', 'soft', 'medium', 'bold'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => applyPreset(p)}
            className="py-1 text-[11px] font-medium rounded-md bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 capitalize transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Color */}
      <ColorControl
        label="Shadow Color"
        value={value.color}
        onChange={(color) => onChange({ ...value, color })}
        defaultValue="rgba(0,0,0,0.1)"
      />

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="flex justify-between text-gray-700">
            <span>X Offset</span>
            <span className="font-mono text-gray-500">{value.x ?? 0}px</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={value.x ?? 0}
            onChange={(e) => onChange({ ...value, x: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-gray-700">
            <span>Y Offset</span>
            <span className="font-mono text-gray-500">{value.y ?? 4}px</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={value.y ?? 4}
            onChange={(e) => onChange({ ...value, y: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-gray-700">
            <span>Blur</span>
            <span className="font-mono text-gray-500">{value.blur ?? 12}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={value.blur ?? 12}
            onChange={(e) => onChange({ ...value, blur: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-gray-700">
            <span>Spread</span>
            <span className="font-mono text-gray-500">{value.spread ?? 0}px</span>
          </div>
          <input
            type="range"
            min="-30"
            max="50"
            value={value.spread ?? 0}
            onChange={(e) => onChange({ ...value, spread: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600"
          />
        </div>
      </div>

      {/* Inset toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-200">
        <span className="text-xs font-medium text-gray-700">Position</span>
        <div className="inline-flex rounded-md p-0.5 bg-gray-200/60 text-xs">
          <button
            type="button"
            onClick={() => onChange({ ...value, inset: false })}
            className={`px-2 py-0.5 rounded-sm ${
              !value.inset ? 'bg-white text-indigo-600 font-semibold shadow-2xs' : 'text-gray-600'
            }`}
          >
            Outline
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, inset: true })}
            className={`px-2 py-0.5 rounded-sm ${
              value.inset ? 'bg-white text-indigo-600 font-semibold shadow-2xs' : 'text-gray-600'
            }`}
          >
            Inset
          </button>
        </div>
      </div>
    </div>
  );
}
