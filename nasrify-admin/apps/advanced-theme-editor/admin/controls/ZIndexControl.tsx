'use client';

import React from 'react';
import { LayoutSettings } from '../../shared/types';

interface ZIndexControlProps {
  value?: LayoutSettings;
  onChange: (val: LayoutSettings) => void;
}

export function ZIndexControl({ value = {}, onChange }: ZIndexControlProps) {
  return (
    <div className="space-y-3 p-3 bg-gray-50/70 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between pb-1 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Position & Identifiers</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Position</label>
          <select
            value={value.position || 'default'}
            onChange={(e) => onChange({ ...value, position: e.target.value as any })}
            className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5"
          >
            <option value="default">Default</option>
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
            <option value="fixed">Fixed</option>
            <option value="sticky">Sticky</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Z-Index</label>
          <input
            type="number"
            value={value.zIndex ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                zIndex: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
              })
            }
            placeholder="auto"
            className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Overflow</label>
          <select
            value={value.overflow || 'visible'}
            onChange={(e) => onChange({ ...value, overflow: e.target.value as any })}
            className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5"
          >
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="scroll">Scroll</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Max Width</label>
          <input
            type="text"
            value={value.maxWidth || ''}
            onChange={(e) => onChange({ ...value, maxWidth: e.target.value })}
            placeholder="e.g. 1200px, 100%"
            className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">CSS ID</label>
          <input
            type="text"
            value={value.cssId || ''}
            onChange={(e) => onChange({ ...value, cssId: e.target.value })}
            placeholder="my-hero-section"
            className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">CSS Classes</label>
          <input
            type="text"
            value={value.cssClasses || ''}
            onChange={(e) => onChange({ ...value, cssClasses: e.target.value })}
            placeholder="class-a class-b"
            className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5"
          />
        </div>
      </div>
    </div>
  );
}
