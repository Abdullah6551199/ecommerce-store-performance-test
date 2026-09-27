"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export interface ColorControlProps {
  label: string;
  value?: string;
  onChange: (color: string) => void;
  presetSwatches?: string[];
  allowAlpha?: boolean;
  description?: string;
}

const DEFAULT_PRESETS = [
  "#25D366", // WhatsApp Green
  "#10B981", // Emerald
  "#059669", // Dark Emerald
  "#18181B", // Dark Zinc
  "#09090B", // Near Black
  "#FFFFFF", // Pure White
  "#3B82F6", // Blue
  "#2563EB", // Royal Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#64748B", // Slate
  "#334155", // Slate dark
];

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseToRgba(colorStr: string): RgbaColor {
  if (!colorStr || colorStr === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // Handle rgba(...) or rgb(...)
  if (colorStr.startsWith("rgb")) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: match[4] !== undefined ? parseFloat(match[4]) : 1,
      };
    }
  }

  // Handle Hex
  let hex = colorStr.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  if (hex.length === 6 || hex.length === 8) {
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const a = hex.length === 8 ? Math.round((parseInt(hex.substring(6, 8), 16) / 255) * 100) / 100 : 1;
    return { r, g, b, a };
  }

  return { r: 24, g: 24, b: 27, a: 1 };
}

function rgbaToHex(rgba: RgbaColor): string {
  const toHex = (n: number) => {
    const h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return h.length === 1 ? "0" + h : h;
  };
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
}

function rgbaToString(rgba: RgbaColor): string {
  if (rgba.a === 1) {
    return rgbaToHex(rgba);
  }
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}

export function ColorControl({
  label,
  value = "#18181B",
  onChange,
  presetSwatches = DEFAULT_PRESETS,
  allowAlpha = true,
  description,
}: ColorControlProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  const [rgba, setRgba] = useState<RgbaColor>(() => parseToRgba(value));
  const [hexInput, setHexInput] = useState<string>(() => rgbaToHex(parseToRgba(value)));
  const [userPresets, setUserPresets] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("nasrify_theme_user_color_presets");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state if external value changes
  useEffect(() => {
    const parsed = parseToRgba(value);
    setRgba(parsed);
    setHexInput(rgbaToHex(parsed));
  }, [value]);

  const updateCoordinates = useCallback(() => {
    if (typeof window === "undefined" || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = 320;
    const popupHeight = 440;

    let left = rect.left;
    if (left + popupWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - popupWidth - 16);
    }

    // Smart flip: if bottom overflows screen, open upward
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldFlip = spaceBelow < popupHeight && rect.top > popupHeight;

    let top = shouldFlip ? rect.top - popupHeight - 8 : rect.bottom + 8;
    if (top < 16) top = 16;

    setIsFlipped(shouldFlip);
    setCoords({ top, left });
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      updateCoordinates();
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateCoordinates);
    window.addEventListener("scroll", updateCoordinates, true);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateCoordinates);
      window.removeEventListener("scroll", updateCoordinates, true);
    };
  }, [isOpen, updateCoordinates]);

  const commitColor = (newRgba: RgbaColor) => {
    setRgba(newRgba);
    const hex = rgbaToHex(newRgba);
    setHexInput(hex);
    const result = rgbaToString(newRgba);
    onChange(result);
  };

  const handleHexChange = (newHex: string) => {
    setHexInput(newHex);
    if (/^#[0-9A-Fa-f]{6}$/.test(newHex) || /^#[0-9A-Fa-f]{3}$/.test(newHex)) {
      const parsed = parseToRgba(newHex);
      parsed.a = rgba.a;
      setRgba(parsed);
      onChange(rgbaToString(parsed));
    }
  };

  const handleRgbChannelChange = (channel: "r" | "g" | "b", val: number) => {
    const clamped = Math.max(0, Math.min(255, isNaN(val) ? 0 : val));
    const next = { ...rgba, [channel]: clamped };
    commitColor(next);
  };

  const handleOpacityChange = (percent: number) => {
    const a = Math.max(0, Math.min(100, isNaN(percent) ? 100 : percent)) / 100;
    const next = { ...rgba, a: Math.round(a * 100) / 100 };
    commitColor(next);
  };

  const handleEyedropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const parsed = parseToRgba(result.sRGBHex);
          parsed.a = rgba.a;
          commitColor(parsed);
        }
      } catch (err) {
        // User cancelled eyedropper
      }
    }
  };

  const handleClear = () => {
    commitColor({ r: 0, g: 0, b: 0, a: 0 });
  };

  const handleSavePreset = () => {
    const currentStr = rgbaToString(rgba);
    if (!userPresets.includes(currentStr)) {
      const updated = [currentStr, ...userPresets].slice(0, 16);
      setUserPresets(updated);
      try {
        localStorage.setItem("nasrify_theme_user_color_presets", JSON.stringify(updated));
      } catch {}
    }
  };

  const hasEyedropper = typeof window !== "undefined" && "EyeDropper" in window;
  const currentColorString = rgbaToString(rgba);
  const currentHex = rgbaToHex(rgba);

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="text-slate-300 font-medium">{label}</label>
        {description && <span className="text-[10px] text-slate-500">{description}</span>}
      </div>

      {/* Trigger Row */}
      <div className="flex items-center gap-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          title="Open Color Palette"
          className="relative w-8 h-8 rounded-lg border border-slate-700 overflow-hidden shrink-0 shadow-inner hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
        >
          {rgba.a === 0 ? (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[10px] text-rose-400 font-bold">
              ∅
            </div>
          ) : (
            <div
              className="w-full h-full"
              style={{ backgroundColor: currentColorString }}
            />
          )}
        </button>

        <input
          type="text"
          value={currentColorString}
          onChange={(e) => {
            const v = e.target.value;
            setHexInput(v);
            onChange(v);
          }}
          placeholder="#HEX or rgba()"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-hidden focus:border-emerald-500"
        />

        {hasEyedropper && (
          <button
            type="button"
            onClick={handleEyedropper}
            title="Pick color from screen"
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4 4.001 4.001 0 014-4h1.5a1.5 1.5 0 001.5-1.5V10a3 3 0 013-3h1a3 3 0 013 3v1.5a1.5 1.5 0 001.5 1.5H19a4 4 0 014 4 4 4 0 01-4 4H7z" />
            </svg>
          </button>
        )}
      </div>

      {/* React Portal Popup (BUG-2 Complete System) */}
      {mounted &&
        isOpen &&
        typeof document !== "undefined" &&
        document.body &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: "320px",
              maxHeight: "500px",
              zIndex: 99999,
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-100 select-none text-xs overflow-y-auto custom-scrollbar"
          >
            {/* Header: Title + Eyedropper + Clear + Close */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <span>🎨</span>
                <span>Color System</span>
              </span>
              <div className="flex items-center gap-1.5">
                {hasEyedropper && (
                  <button
                    type="button"
                    onClick={handleEyedropper}
                    title="Eyedropper"
                    className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4 4.001 4.001 0 014-4h1.5a1.5 1.5 0 001.5-1.5V10a3 3 0 013-3h1a3 3 0 013 3v1.5a1.5 1.5 0 001.5 1.5H19a4 4 0 014 4 4 4 0 01-4 4H7z" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear Color"
                  className="px-1.5 py-0.5 rounded text-[10px] text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs p-1 rounded hover:bg-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Native Color Picker + Hex Input */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-lg border border-slate-700 overflow-hidden shrink-0 shadow-inner group">
                <input
                  type="color"
                  value={currentHex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="absolute -inset-2 w-16 h-16 cursor-pointer opacity-0 z-10"
                />
                <div
                  className="w-full h-full flex items-center justify-center text-white/50 text-[10px]"
                  style={{ backgroundColor: currentColorString }}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
                </div>
              </div>

              <div className="flex-1 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono block">HEX Code</span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* RGBA Channel Inputs */}
            <div className="space-y-1 pt-1.5 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                RGB Channels
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <span className="text-[9px] text-slate-500 block text-center">R</span>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgba.r}
                    onChange={(e) => handleRgbChannelChange("r", parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-100 text-center font-mono"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block text-center">G</span>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgba.g}
                    onChange={(e) => handleRgbChannelChange("g", parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-100 text-center font-mono"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block text-center">B</span>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgba.b}
                    onChange={(e) => handleRgbChannelChange("b", parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-100 text-center font-mono"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block text-center">A (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(rgba.a * 100)}
                    onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-100 text-center font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Opacity Slider */}
            {allowAlpha && (
              <div className="space-y-1 pt-1.5 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Opacity</span>
                  <span className="font-mono text-slate-300">{Math.round(rgba.a * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(rgba.a * 100)}
                  onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}

            {/* Default Preset Swatches */}
            {presetSwatches.length > 0 && (
              <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Presets Palette
                  </span>
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    + Save Current
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {presetSwatches.map((color, i) => (
                    <button
                      key={`${color}-${i}`}
                      type="button"
                      onClick={() => {
                        const parsed = parseToRgba(color);
                        parsed.a = rgba.a;
                        commitColor(parsed);
                      }}
                      title={color}
                      className="w-5 h-5 rounded-md border border-slate-700 hover:scale-120 transition-transform shadow-xs shrink-0 cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Saved User Presets */}
            {userPresets.length > 0 && (
              <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Saved Swatches
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {userPresets.map((color, i) => (
                    <button
                      key={`custom-${color}-${i}`}
                      type="button"
                      onClick={() => {
                        const parsed = parseToRgba(color);
                        commitColor(parsed);
                      }}
                      title={color}
                      className="w-5 h-5 rounded-md border border-slate-700 hover:scale-120 transition-transform shadow-xs shrink-0 cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

export default ColorControl;
