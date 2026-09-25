'use client';

import React from 'react';

interface ColorControlProps {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  onReset?: () => void;
  defaultValue?: string;
  className?: string;
}

export function ColorControl({
  label,
  value = '',
  onChange,
  onReset,
  defaultValue = '',
  className = '',
}: ColorControlProps) {
  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <span className="text-xs text-gray-700 font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden bg-white shadow-2xs">
          <input
            type="color"
            value={value && value.startsWith('#') && value.length === 7 ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-7 h-7 border-0 cursor-pointer p-0 -m-1"
          />
          <input
            type="text"
            value={value}
            placeholder={defaultValue || '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 px-1.5 py-0.5 text-xs font-mono text-gray-800 border-0 focus:ring-0 focus:outline-none"
          />
        </div>
        {onReset && value && (
          <button
            type="button"
            onClick={onReset}
            title="Reset color"
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
