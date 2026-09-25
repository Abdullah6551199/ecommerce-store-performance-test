"use client";

import React, { useState } from "react";

interface ColorControlProps {
  label: string;
  value?: string;
  onChange: (color: string) => void;
  presetSwatches?: string[];
  allowAlpha?: boolean;
  description?: string;
}

const DEFAULT_PRESETS = [
  "#25D366", // WhatsApp Green
  "#18181B", // Dark Zinc
  "#09090B", // Near Black
  "#FFFFFF", // White
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#10B981", // Emerald
  "#64748B", // Slate
  "#E2E8F0", // Slate light
];

export function ColorControl({
  label,
  value = "#18181B",
  onChange,
  presetSwatches = DEFAULT_PRESETS,
  allowAlpha = true,
  description,
}: ColorControlProps) {
  const [opacity, setOpacity] = useState<number>(() => {
    if (value && value.startsWith("rgba")) {
      const match = value.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      if (match) return Math.round(parseFloat(match[1]) * 100);
    }
    return 100;
  });

  const [hexInput, setHexInput] = useState<string>(() => {
    if (value && value.startsWith("#")) return value;
    return "#18181B";
  });

  const handleColorChange = (newHex: string) => {
    setHexInput(newHex);
    if (opacity < 100 && allowAlpha) {
      const rgba = hexToRgba(newHex, opacity / 100);
      onChange(rgba);
    } else {
      onChange(newHex);
    }
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    if (newOpacity < 100 && allowAlpha) {
      const rgba = hexToRgba(hexInput, newOpacity / 100);
      onChange(rgba);
    } else {
      onChange(hexInput);
    }
  };

  const handleEyedropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleColorChange(result.sRGBHex);
        }
      } catch (err) {
        // User canceled eyedropper
      }
    }
  };

  const hasEyedropper = typeof window !== "undefined" && "EyeDropper" in window;

  return (
    <div className="space-y-2 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <label className="font-medium text-slate-300">{label}</label>
        {description && <span className="text-[10px] text-slate-500">{description}</span>}
      </div>

      <div className="flex items-center gap-2">
        {/* Color preview + native picker */}
        <div className="relative w-8 h-8 rounded-lg border border-slate-700 overflow-hidden shrink-0 shadow-inner">
          <input
            type="color"
            value={hexInput.startsWith("#") && hexInput.length === 7 ? hexInput : "#18181B"}
            onChange={(e) => handleColorChange(e.target.value)}
            className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor: value || hexInput }}
          />
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={value || hexInput}
          onChange={(e) => {
            const v = e.target.value;
            setHexInput(v);
            onChange(v);
          }}
          placeholder="#HEX or rgba()"
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#25D366]"
        />

        {/* Eyedropper Button */}
        {hasEyedropper && (
          <button
            type="button"
            onClick={handleEyedropper}
            title="Pick color from screen"
            className="p-1.5 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4 4.001 4.001 0 014-4h1.5a1.5 1.5 0 001.5-1.5V10a3 3 0 013-3h1a3 3 0 013 3v1.5a1.5 1.5 0 001.5 1.5H19a4 4 0 014 4 4 4 0 01-4 4H7z" />
            </svg>
          </button>
        )}
      </div>

      {/* Opacity slider */}
      {allowAlpha && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-500 uppercase font-mono w-12">Opacity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
          />
          <span className="text-[10px] text-slate-400 font-mono w-8 text-right">{opacity}%</span>
        </div>
      )}

      {/* Swatches */}
      {presetSwatches.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {presetSwatches.map((color, i) => (
            <button
              key={`${color}-${i}`}
              type="button"
              onClick={() => handleColorChange(color)}
              title={color}
              className="w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform shadow-xs shrink-0"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  if (c.length === 6) {
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

export default ColorControl;
