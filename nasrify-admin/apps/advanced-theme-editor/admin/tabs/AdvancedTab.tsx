'use client';

import React, { useState } from 'react';
import { SectionAdvancedData, BreakpointDevice } from '../../shared/types';
import { SpacingControl } from '../controls/SpacingControl';
import { ZIndexControl } from '../controls/ZIndexControl';
import { AnimationControl } from '../controls/AnimationControl';
import { CustomCSSControl } from '../controls/CustomCSSControl';
import { ResponsiveControl } from '../controls/ResponsiveControl';

interface AdvancedTabProps {
  sectionId: string;
  data?: SectionAdvancedData;
  onChange: (newData: SectionAdvancedData) => void;
  currentDevice: BreakpointDevice;
  onDeviceChange: (device: BreakpointDevice) => void;
}

export function AdvancedTab({
  sectionId,
  data = {},
  onChange,
  currentDevice,
  onDeviceChange,
}: AdvancedTabProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('layout');
  const advanced = data.advanced || {};

  const updateAdvanced = (subKey: keyof NonNullable<SectionAdvancedData['advanced']>, val: any) => {
    onChange({
      ...data,
      advanced: {
        ...(data.advanced || {}),
        [subKey]: val,
      },
    });
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const layout = advanced.layout || {};
  const currentMargin = layout.margin?.[currentDevice] || { top: '', right: '', bottom: '', left: '', linked: true, unit: 'px' };
  const currentPadding = layout.padding?.[currentDevice] || { top: '', right: '', bottom: '', left: '', linked: true, unit: 'px' };

  const handleMarginChange = (val: any) => {
    updateAdvanced('layout', {
      ...layout,
      margin: {
        ...(layout.margin || {}),
        [currentDevice]: val,
      },
    });
  };

  const handlePaddingChange = (val: any) => {
    updateAdvanced('layout', {
      ...layout,
      padding: {
        ...(layout.padding || {}),
        [currentDevice]: val,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* 1. Layout (Margins, Paddings, Width) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleAccordion('layout')}
          className="w-full px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between text-left transition-colors"
        >
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
              <rect x="7" y="7" width="10" height="10" rx="1" strokeWidth="2" strokeDasharray="2 2" />
            </svg>
            Layout & Spacing
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${activeAccordion === 'layout' ? 'rotate-180' : ''}`}
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
        {activeAccordion === 'layout' && (
          <div className="p-3 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-700">Device Mode</span>
              <ResponsiveControl currentDevice={currentDevice} onDeviceChange={onDeviceChange} />
            </div>

            {/* Margin */}
            <SpacingControl
              label={`Margin (${currentDevice})`}
              value={currentMargin}
              onChange={handleMarginChange}
            />

            {/* Padding */}
            <SpacingControl
              label={`Padding (${currentDevice})`}
              value={currentPadding}
              onChange={handlePaddingChange}
            />

            {/* Width */}
            <div className="space-y-1 pt-1 border-t border-gray-200">
              <label className="text-xs font-medium text-gray-700">Section Width</label>
              <select
                value={layout.width || 'auto'}
                onChange={(e) => updateAdvanced('layout', { ...layout, width: e.target.value as any })}
                className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5"
              >
                <option value="auto">Default (Boxed / Theme Auto)</option>
                <option value="full">Full Width (100%)</option>
                <option value="custom">Custom Width</option>
              </select>
            </div>

            {layout.width === 'custom' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Custom Width ({currentDevice})</label>
                <input
                  type="text"
                  value={layout.customWidth?.[currentDevice] || ''}
                  onChange={(e) =>
                    updateAdvanced('layout', {
                      ...layout,
                      customWidth: {
                        ...(layout.customWidth || {}),
                        [currentDevice]: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. 800px, 80%"
                  className="w-full text-xs font-mono bg-white border border-gray-300 rounded-md px-2 py-1.5"
                />
              </div>
            )}

            {/* Position, Z-Index, MaxWidth, IDs */}
            <ZIndexControl
              value={layout}
              onChange={(updatedLayout) => updateAdvanced('layout', updatedLayout)}
            />
          </div>
        )}
      </div>

      {/* 2. Motion Effects */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleAccordion('motion')}
          className="w-full px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between text-left transition-colors"
        >
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Motion Effects & Animations
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${activeAccordion === 'motion' ? 'rotate-180' : ''}`}
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
        {activeAccordion === 'motion' && (
          <div className="p-3">
            <AnimationControl
              value={advanced.motion}
              onChange={(motion) => updateAdvanced('motion', motion)}
            />
          </div>
        )}
      </div>

      {/* 3. Responsive Visibility */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleAccordion('responsive')}
          className="w-full px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between text-left transition-colors"
        >
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Responsive Visibility
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${activeAccordion === 'responsive' ? 'rotate-180' : ''}`}
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
        {activeAccordion === 'responsive' && (
          <div className="p-3 space-y-2.5">
            <p className="text-[11px] text-gray-600">
              Toggle visibility of this section on specific devices:
            </p>
            <label className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-200 cursor-pointer">
              <span className="text-xs font-medium text-gray-800">Hide on Desktop</span>
              <input
                type="checkbox"
                checked={Boolean(advanced.responsive?.hideOnDesktop)}
                onChange={(e) =>
                  updateAdvanced('responsive', {
                    ...(advanced.responsive || {}),
                    hideOnDesktop: e.target.checked,
                  })
                }
                className="rounded-sm text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-200 cursor-pointer">
              <span className="text-xs font-medium text-gray-800">Hide on Tablet</span>
              <input
                type="checkbox"
                checked={Boolean(advanced.responsive?.hideOnTablet)}
                onChange={(e) =>
                  updateAdvanced('responsive', {
                    ...(advanced.responsive || {}),
                    hideOnTablet: e.target.checked,
                  })
                }
                className="rounded-sm text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-200 cursor-pointer">
              <span className="text-xs font-medium text-gray-800">Hide on Mobile</span>
              <input
                type="checkbox"
                checked={Boolean(advanced.responsive?.hideOnMobile)}
                onChange={(e) =>
                  updateAdvanced('responsive', {
                    ...(advanced.responsive || {}),
                    hideOnMobile: e.target.checked,
                  })
                }
                className="rounded-sm text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        )}
      </div>

      {/* 4. Custom CSS */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleAccordion('customCss')}
          className="w-full px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between text-left transition-colors"
        >
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Custom CSS
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${activeAccordion === 'customCss' ? 'rotate-180' : ''}`}
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
        {activeAccordion === 'customCss' && (
          <div className="p-3">
            <CustomCSSControl
              sectionId={sectionId}
              value={advanced.customCss}
              onChange={(css) => updateAdvanced('customCss', css)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
