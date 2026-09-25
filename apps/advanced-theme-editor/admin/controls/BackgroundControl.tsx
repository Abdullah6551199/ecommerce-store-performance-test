'use client';

import React from 'react';
import { BackgroundSettings } from '../../shared/types';
import { ColorControl } from './ColorControl';

interface BackgroundControlProps {
  value?: BackgroundSettings;
  onChange: (val: BackgroundSettings) => void;
}

export function BackgroundControl({ value = { type: 'none' }, onChange }: BackgroundControlProps) {
  const currentType = value.type || 'none';

  return (
    <div className="space-y-3 p-3 bg-gray-50/70 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between pb-1 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Background</span>
      </div>

      {/* Type Switcher */}
      <div className="grid grid-cols-4 gap-1 p-0.5 bg-gray-200/60 rounded-lg">
        {(['none', 'classic', 'gradient', 'image'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ ...value, type: t })}
            className={`py-1 text-xs font-medium rounded-md capitalize transition-colors ${
              currentType === t ? 'bg-white text-indigo-600 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Classic: Solid Color */}
      {currentType === 'classic' && (
        <ColorControl
          label="Background Color"
          value={value.color}
          onChange={(color) => onChange({ ...value, color })}
          onReset={() => onChange({ ...value, color: undefined })}
        />
      )}

      {/* Gradient */}
      {currentType === 'gradient' && (
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <ColorControl
              label="Color 1"
              value={value.gradient?.color1 || '#3B82F6'}
              onChange={(color1) =>
                onChange({
                  ...value,
                  gradient: {
                    type: value.gradient?.type || 'linear',
                    angle: value.gradient?.angle || 90,
                    color1,
                    color2: value.gradient?.color2 || '#8B5CF6',
                  },
                })
              }
            />
            <ColorControl
              label="Color 2"
              value={value.gradient?.color2 || '#8B5CF6'}
              onChange={(color2) =>
                onChange({
                  ...value,
                  gradient: {
                    type: value.gradient?.type || 'linear',
                    angle: value.gradient?.angle || 90,
                    color1: value.gradient?.color1 || '#3B82F6',
                    color2,
                  },
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Type</label>
              <select
                value={value.gradient?.type || 'linear'}
                onChange={(e) =>
                  onChange({
                    ...value,
                    gradient: {
                      color1: value.gradient?.color1 || '#3B82F6',
                      color2: value.gradient?.color2 || '#8B5CF6',
                      angle: value.gradient?.angle || 90,
                      type: e.target.value as any,
                    },
                  })
                }
                className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </div>

            {value.gradient?.type !== 'radial' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-medium text-gray-700">Angle</label>
                  <span className="font-mono text-gray-500">{value.gradient?.angle ?? 90}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={value.gradient?.angle ?? 90}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      gradient: {
                        color1: value.gradient?.color1 || '#3B82F6',
                        color2: value.gradient?.color2 || '#8B5CF6',
                        type: 'linear',
                        angle: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image */}
      {currentType === 'image' && (
        <div className="space-y-2 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Image URL</label>
            <input
              type="text"
              value={value.image?.url || ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  image: {
                    position: 'center',
                    size: 'cover',
                    repeat: 'no-repeat',
                    attachment: 'scroll',
                    ...(value.image || {}),
                    url: e.target.value,
                  },
                })
              }
              placeholder="https://... or /media/..."
              className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Position</label>
              <select
                value={value.image?.position || 'center'}
                onChange={(e) =>
                  onChange({
                    ...value,
                    image: {
                      url: value.image?.url || '',
                      size: 'cover',
                      repeat: 'no-repeat',
                      attachment: 'scroll',
                      ...(value.image || {}),
                      position: e.target.value as any,
                    },
                  })
                }
                className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Size</label>
              <select
                value={value.image?.size || 'cover'}
                onChange={(e) =>
                  onChange({
                    ...value,
                    image: {
                      url: value.image?.url || '',
                      position: 'center',
                      repeat: 'no-repeat',
                      attachment: 'scroll',
                      ...(value.image || {}),
                      size: e.target.value as any,
                    },
                  })
                }
                className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
