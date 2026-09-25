'use client';

import React, { useState } from 'react';
import { SpacingValue } from '../../shared/types';

interface SpacingControlProps {
  label: string;
  value?: SpacingValue;
  onChange: (val: SpacingValue) => void;
  units?: Array<'px' | 'rem' | 'em' | '%'>;
  className?: string;
}

export function SpacingControl({
  label,
  value = { top: '', right: '', bottom: '', left: '', linked: true, unit: 'px' },
  onChange,
  units = ['px', 'rem', '%'],
  className = '',
}: SpacingControlProps) {
  const isLinked = value.linked ?? true;
  const currentUnit = value.unit || 'px';

  const handleUnitChange = (newUnit: 'px' | 'rem' | 'em' | '%') => {
    onChange({ ...value, unit: newUnit });
  };

  const handleToggleLinked = () => {
    onChange({ ...value, linked: !isLinked });
  };

  const handleChangeSide = (side: 'top' | 'right' | 'bottom' | 'left', val: string) => {
    if (isLinked) {
      onChange({
        ...value,
        top: val,
        right: val,
        bottom: val,
        left: val,
      });
    } else {
      onChange({
        ...value,
        [side]: val,
      });
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-1">
          {/* Unit selector */}
          <div className="inline-flex rounded-sm bg-gray-100 p-0.5 border border-gray-200">
            {units.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => handleUnitChange(u)}
                className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-xs transition-colors ${
                  currentUnit === u ? 'bg-white text-indigo-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Link toggle */}
          <button
            type="button"
            onClick={handleToggleLinked}
            title={isLinked ? 'Unlink values (independent)' : 'Link values (together)'}
            className={`p-1 rounded-sm border transition-colors ${
              isLinked
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              {isLinked ? (
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <div key={side} className="flex flex-col items-center">
            <input
              type="text"
              value={value[side] ?? ''}
              onChange={(e) => handleChangeSide(side, e.target.value)}
              placeholder="0"
              className="w-full text-center px-1 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-[10px] text-gray-600 uppercase mt-0.5 tracking-wider font-semibold">{side}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
