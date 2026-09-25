'use client';

import React from 'react';

interface ContentTabProps {
  sectionId: string;
  sectionType: string;
  settings: Record<string, any>;
  onUpdateSetting: (key: string, value: any) => void;
}

export function ContentTab({ sectionId, sectionType, settings, onUpdateSetting }: ContentTabProps) {
  const keys = Object.keys(settings).filter((k) => !k.startsWith('_'));

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-blue-900 capitalize">{sectionType.replace(/_/g, ' ')}</span>
          <p className="text-[11px] text-blue-800">Configure content variables for this section</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded-sm">
          #{sectionId}
        </span>
      </div>

      {keys.length === 0 ? (
        <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          No core text settings for this section. Switch to <span className="font-semibold text-indigo-600">Style</span> or <span className="font-semibold text-indigo-600">Advanced</span> to customize appearance.
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => {
            const val = settings[k];
            const isBool = typeof val === 'boolean';
            const isNum = typeof val === 'number';

            return (
              <div key={k} className="p-3 bg-gray-50/70 rounded-lg border border-gray-200 space-y-1">
                <label className="text-xs font-medium text-gray-700 capitalize">
                  {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                </label>
                {isBool ? (
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => onUpdateSetting(k, e.target.checked)}
                      className="rounded-sm text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-gray-600">Enabled</span>
                  </label>
                ) : isNum ? (
                  <input
                    type="number"
                    value={val ?? ''}
                    onChange={(e) => onUpdateSetting(k, parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={val ?? ''}
                    onChange={(e) => onUpdateSetting(k, e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
