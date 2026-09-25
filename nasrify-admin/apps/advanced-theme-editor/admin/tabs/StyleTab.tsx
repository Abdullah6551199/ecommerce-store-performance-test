'use client';

import React, { useState } from 'react';
import { SectionAdvancedData, BreakpointDevice } from '../../shared/types';
import { TypographyControl } from '../controls/TypographyControl';
import { BackgroundControl } from '../controls/BackgroundControl';
import { BorderControl } from '../controls/BorderControl';
import { BoxShadowControl } from '../controls/BoxShadowControl';
import { BUILTIN_PRESETS } from '../../lib/presets';

interface StyleTabProps {
  sectionId: string;
  data?: SectionAdvancedData;
  onChange: (newData: SectionAdvancedData) => void;
  currentDevice: BreakpointDevice;
  onDeviceChange: (device: BreakpointDevice) => void;
}

export function StyleTab({
  sectionId,
  data = {},
  onChange,
  currentDevice,
  onDeviceChange,
}: StyleTabProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('typography');
  const style = data.style || {};

  const updateStyle = (subKey: keyof NonNullable<SectionAdvancedData['style']>, val: any) => {
    onChange({
      ...data,
      style: {
        ...(data.style || {}),
        [subKey]: val,
      },
    });
  };

  const applyPreset = (presetId: string) => {
    const p = BUILTIN_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    try {
      const parsed = JSON.parse(p.presetJson);
      if (p.type === 'typography') {
        updateStyle('typography', { ...(style.typography || {}), ...parsed });
      } else if (p.type === 'shadow') {
        updateStyle('boxShadow', { ...(style.boxShadow || {}), color: parsed.boxShadow });
      }
    } catch {}
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {/* 1-Click Style Presets */}
      <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-indigo-950">Style Presets</span>
          <p className="text-[10px] text-indigo-800">Quickly apply pre-built designs</p>
        </div>
        <select
          onChange={(e) => {
            if (e.target.value) {
              applyPreset(e.target.value);
              e.target.value = '';
            }
          }}
          className="text-xs bg-white border border-indigo-200 text-indigo-900 rounded-md px-2 py-1 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Apply Preset...</option>
          <optgroup label="Typography">
            <option value="preset_typo_heading">Modern Heading</option>
            <option value="preset_typo_serif">Editorial Serif</option>
            <option value="preset_typo_impact">Impact Display</option>
          </optgroup>
          <optgroup label="Shadows">
            <option value="preset_shadow_soft">Soft Shadow</option>
            <option value="preset_shadow_medium">Medium Shadow</option>
            <option value="preset_shadow_bold">Bold Shadow</option>
          </optgroup>
        </select>
      </div>

      {/* Accordions */}

      {/* 1. Typography */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleAccordion('typography')}
          className="w-full px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between text-left transition-colors"
        >
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            Typography
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${activeAccordion === 'typography' ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {activeAccordion === 'typography' && (
          <div className="p-3">
            <TypographyControl
              value={style.typography}
              onChange={(typo) => updateStyle('typography', typo)}
              currentDevice={currentDevice}
              onDeviceChange={onDeviceChange}
            />
          </div>
        )}
      </div>

      {/* 2. Background */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleAccordion('background')}
          className="w-full px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between text-left transition-colors"
        >
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4 5 5 0 013-4.5V11a5 5 0 0110 0v1.5a5 5 0 013 4.5 4 4 0 01-4 4H7z" />
            </svg>
            Background
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${activeAccordion === 'background' ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {activeAccordion === 'background' && (
          <div className="p-3">
            <BackgroundControl
              value={style.background}
              onChange={(bg) => updateStyle('background', bg)}
            />
          </div>
        )}
      </div>

      {/* 3. Border */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleAccordion('border')}
          className="w-full px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between text-left transition-colors"
        >
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
            </svg>
            Border & Radius
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${activeAccordion === 'border' ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {activeAccordion === 'border' && (
          <div className="p-3">
            <BorderControl
              value={style.border}
              onChange={(b) => updateStyle('border', b)}
            />
          </div>
        )}
      </div>

      {/* 4. Box Shadow */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleAccordion('boxShadow')}
          className="w-full px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between text-left transition-colors"
        >
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Box Shadow
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${activeAccordion === 'boxShadow' ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {activeAccordion === 'boxShadow' && (
          <div className="p-3">
            <BoxShadowControl
              value={style.boxShadow}
              onChange={(bs) => updateStyle('boxShadow', bs)}
              onReset={() => updateStyle('boxShadow', undefined)}
            />
          </div>
        )}
      </div>

      {/* 5. Effects (Opacity, Filters, Transform) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleAccordion('effects')}
          className="w-full px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between text-left transition-colors"
        >
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Effects & Transform
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${activeAccordion === 'effects' ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {activeAccordion === 'effects' && (
          <div className="p-3 space-y-3">
            {/* Opacity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-gray-700">Opacity</label>
                <span className="font-mono text-gray-500">{style.effects?.opacity ?? 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={style.effects?.opacity ?? 100}
                onChange={(e) =>
                  updateStyle('effects', {
                    ...(style.effects || {}),
                    opacity: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-indigo-600"
              />
            </div>

            {/* CSS Filters: Blur & Brightness */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="flex justify-between text-gray-700">
                  <span>Blur</span>
                  <span className="font-mono text-gray-500">{style.effects?.blur ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={style.effects?.blur ?? 0}
                  onChange={(e) =>
                    updateStyle('effects', {
                      ...(style.effects || {}),
                      blur: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-700">
                  <span>Brightness</span>
                  <span className="font-mono text-gray-500">{style.effects?.brightness ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={style.effects?.brightness ?? 100}
                  onChange={(e) =>
                    updateStyle('effects', {
                      ...(style.effects || {}),
                      brightness: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Transform: Rotate & Scale */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-200">
              <div>
                <div className="flex justify-between text-gray-700">
                  <span>Rotate</span>
                  <span className="font-mono text-gray-500">
                    {style.effects?.transform?.rotate ?? 0}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={style.effects?.transform?.rotate ?? 0}
                  onChange={(e) =>
                    updateStyle('effects', {
                      ...(style.effects || {}),
                      transform: {
                        ...(style.effects?.transform || {}),
                        rotate: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-700">
                  <span>Scale</span>
                  <span className="font-mono text-gray-500">
                    {style.effects?.transform?.scale ?? 1}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={style.effects?.transform?.scale ?? 1}
                  onChange={(e) =>
                    updateStyle('effects', {
                      ...(style.effects || {}),
                      transform: {
                        ...(style.effects?.transform || {}),
                        scale: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
