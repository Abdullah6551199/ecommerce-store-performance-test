'use client';

import React, { useState } from 'react';
import { MotionEffectsSettings } from '../../shared/types';
import { ANIMATION_PRESETS } from '../../lib/animation-presets';

interface AnimationControlProps {
  value?: MotionEffectsSettings;
  onChange: (val: MotionEffectsSettings) => void;
}

export function AnimationControl({ value = {}, onChange }: AnimationControlProps) {
  const [previewKey, setPreviewKey] = useState(0);
  const currentAnimation = value.entranceAnimation || '';

  const triggerPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50/70 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between pb-1 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Entrance Animation</span>
        {currentAnimation && (
          <button
            type="button"
            onClick={triggerPreview}
            className="text-[11px] text-indigo-600 font-medium hover:underline flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Replay
          </button>
        )}
      </div>

      {/* Animation Selector */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Animation</label>
        <select
          value={currentAnimation}
          onChange={(e) => {
            const anim = e.target.value;
            onChange({
              ...value,
              entranceAnimation: anim,
              animationDuration: anim && ANIMATION_PRESETS[anim] ? ANIMATION_PRESETS[anim].duration : value.animationDuration || 800,
            });
            triggerPreview();
          }}
          className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">None (Static)</option>
          <optgroup label="Fade Animations">
            <option value="fadeIn">Fade In</option>
            <option value="fadeInUp">Fade In Up</option>
            <option value="fadeInDown">Fade In Down</option>
            <option value="fadeInLeft">Fade In Left</option>
            <option value="fadeInRight">Fade In Right</option>
          </optgroup>
          <optgroup label="Slide Animations">
            <option value="slideInUp">Slide In Up</option>
            <option value="slideInDown">Slide In Down</option>
            <option value="slideInLeft">Slide In Left</option>
            <option value="slideInRight">Slide In Right</option>
            <option value="backInUp">Back In Up</option>
            <option value="backInDown">Back In Down</option>
            <option value="backInLeft">Back In Left</option>
          </optgroup>
          <optgroup label="Zoom Animations">
            <option value="zoomIn">Zoom In</option>
            <option value="zoomOut">Zoom Out</option>
          </optgroup>
          <optgroup label="Rotate & 3D">
            <option value="rotateIn">Rotate In</option>
            <option value="bounceIn">Bounce In</option>
            <option value="flipInX">Flip In X</option>
            <option value="flipInY">Flip In Y</option>
          </optgroup>
          <optgroup label="Special">
            <option value="lightSpeedIn">Light Speed In</option>
            <option value="rollIn">Roll In</option>
          </optgroup>
        </select>
      </div>

      {currentAnimation && (
        <>
          {/* Duration & Delay */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="flex justify-between text-gray-700">
                <span>Duration</span>
                <span className="font-mono text-gray-500">{value.animationDuration || 800}ms</span>
              </div>
              <input
                type="range"
                min="200"
                max="2500"
                step="50"
                value={value.animationDuration || 800}
                onChange={(e) => onChange({ ...value, animationDuration: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-700">
                <span>Delay</span>
                <span className="font-mono text-gray-500">{value.animationDelay || 0}ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={value.animationDelay || 0}
                onChange={(e) => onChange({ ...value, animationDelay: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Easing */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Timing Function</label>
            <select
              value={value.animationEasing || 'ease-out'}
              onChange={(e) => onChange({ ...value, animationEasing: e.target.value })}
              className="w-full text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5"
            >
              <option value="ease-out">Ease Out (Standard)</option>
              <option value="ease-in-out">Ease In-Out (Smooth)</option>
              <option value="cubic-bezier(0.2, 0.8, 0.2, 1)">Springy (Snappy)</option>
              <option value="cubic-bezier(0.175, 0.885, 0.32, 1.275)">Elastic Bounce</option>
              <option value="linear">Linear</option>
            </select>
          </div>

          {/* Mini Preview Box */}
          <div className="mt-2 p-3 bg-white rounded-md border border-gray-200 flex items-center justify-center overflow-hidden">
            <div
              key={previewKey}
              style={{
                animation: `ate-${currentAnimation} ${value.animationDuration || 800}ms ${
                  value.animationEasing || 'ease-out'
                } ${value.animationDelay || 0}ms both`,
              }}
              className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-sm text-xs font-semibold shadow-2xs"
            >
              Preview Element
            </div>
          </div>
        </>
      )}
    </div>
  );
}
