'use client';

import React from 'react';
import { BorderSettings } from '../../shared/types';
import { ColorControl } from './ColorControl';
import { SpacingControl } from './SpacingControl';

interface BorderControlProps {
  value?: BorderSettings;
  onChange: (val: BorderSettings) => void;
}

export function BorderControl({ value = { type: 'none' }, onChange }: BorderControlProps) {
  const currentType = value.type || 'none';

  return (
    <div className="space-y-3 p-3 bg-gray-50/70 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between pb-1 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Border & Corner</span>
      </div>

      {/* Border Type */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Border Type</label>
        <select
          value={currentType}
          onChange={(e) => onChange({ ...value, type: e.target.value as any })}
          className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="none">None</option>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
        </select>
      </div>

      {/* Border Width & Color when active */}
      {currentType !== 'none' && (
        <>
          <SpacingControl
            label="Border Width"
            value={value.width || { top: '1', right: '1', bottom: '1', left: '1', linked: true, unit: 'px' }}
            onChange={(width) => onChange({ ...value, width })}
            units={['px']}
          />

          <ColorControl
            label="Border Color"
            value={value.color}
            onChange={(color) => onChange({ ...value, color })}
            onReset={() => onChange({ ...value, color: undefined })}
            defaultValue="#e5e7eb"
          />
        </>
      )}

      {/* Border Radius */}
      <SpacingControl
        label="Border Radius"
        value={value.radius || { top: '0', right: '0', bottom: '0', left: '0', linked: true, unit: 'px' }}
        onChange={(radius) => onChange({ ...value, radius })}
        units={['px', 'rem', '%']}
      />
    </div>
  );
}
