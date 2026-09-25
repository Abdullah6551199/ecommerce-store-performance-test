'use client';

import React from 'react';
import { BreakpointDevice } from '../../shared/types';

interface ResponsiveControlProps {
  currentDevice: BreakpointDevice;
  onDeviceChange: (device: BreakpointDevice) => void;
  title?: string;
  className?: string;
}

export function ResponsiveControl({
  currentDevice,
  onDeviceChange,
  title,
  className = '',
}: ResponsiveControlProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {title && <span className="text-xs font-semibold text-gray-700 tracking-wider uppercase">{title}</span>}
      <div className="inline-flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => onDeviceChange('desktop')}
          title="Desktop (1025px+)"
          className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
            currentDevice === 'desktop'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
            <path d="M8 21h8m-4-4v4" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => onDeviceChange('tablet')}
          title="Tablet (768px - 1024px)"
          className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
            currentDevice === 'tablet'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
          <span className="hidden sm:inline">Tablet</span>
        </button>

        <button
          type="button"
          onClick={() => onDeviceChange('mobile')}
          title="Mobile (&lt; 768px)"
          className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
            currentDevice === 'mobile'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="2" width="12" height="20" rx="2" strokeWidth="2" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>
    </div>
  );
}
