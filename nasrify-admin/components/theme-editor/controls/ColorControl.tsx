"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [popupCoords, setPopupCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const updateCoordinates = () => {
    if (typeof window === "undefined") return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popupWidth = 250;
      const popupHeight = 310;

      // Position to the left of the button if space, or below
      let left = rect.left - popupWidth - 8;
      if (left < 16) {
        left = Math.min(window.innerWidth - popupWidth - 16, rect.right - popupWidth);
      }
      let top = rect.top;
      if (top + popupHeight > window.innerHeight - 16) {
        top = Math.max(16, window.innerHeight - popupHeight - 16);
      }

      setPopupCoords({ top, left });
    }
  };

  const handleToggle = () => {
    updateCoordinates();
    setIsOpen((prev) => !prev);
  };

  // Close on outside click or Esc
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
  }, [isOpen]);

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
      } catch {
        // User canceled eyedropper
      }
    }
  };

  const hasEyedropper = typeof window !== "undefined" && "EyeDropper" in window;
  const currentColor = value || hexInput;

  return (
    <div className="space-y-1.5 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <label className="font-medium text-slate-300">{label}</label>
        {description && <span className="text-[10px] text-slate-500">{description}</span>}
      </div>

      <div className="flex items-center gap-2">
        {/* Color preview button trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          title="Open color palette"
          className="relative w-8 h-8 rounded-lg border border-slate-700 overflow-hidden shrink-0 shadow-inner hover:scale-105 transition-transform"
        >
          <div
            className="w-full h-full"
            style={{ backgroundColor: currentColor }}
          />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={currentColor}
          onChange={(e) => {
            const v = e.target.value;
            setHexInput(v);
            onChange(v);
          }}
          placeholder="#HEX or rgba()"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-hidden focus:border-emerald-500"
        />

        {/* Eyedropper Button */}
        {hasEyedropper && (
          <button
            type="button"
            onClick={handleEyedropper}
            title="Pick color from screen"
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4 4.001 4.001 0 014-4h1.5a1.5 1.5 0 001.5-1.5V10a3 3 0 013-3h1a3 3 0 013 3v1.5a1.5 1.5 0 001.5 1.5H19a4 4 0 014 4 4 4 0 01-4 4H7z" />
            </svg>
          </button>
        )}
      </div>

      {/* React Portal Popup (Stage 47.1 - BUG-2) */}
      {mounted &&
        isOpen &&
        typeof document !== "undefined" &&
        document.body &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: `${popupCoords.top}px`,
              left: `${popupCoords.left}px`,
              width: "250px",
              zIndex: 9999,
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 space-y-3 animate-in fade-in duration-100 select-none text-xs"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-semibold text-slate-200 text-xs">Color Palette</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs p-0.5"
              >
                ✕
              </button>
            </div>

            {/* Native picker + Hex swatch */}
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-lg border border-slate-700 overflow-hidden shrink-0 shadow-inner">
                <input
                  type="color"
                  value={hexInput.startsWith("#") && hexInput.length === 7 ? hexInput : "#18181B"}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="absolute -inset-2 w-14 h-14 cursor-pointer opacity-0"
                />
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: currentColor }}
                />
              </div>

              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Current Hex</span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Opacity slider */}
            {allowAlpha && (
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Opacity</span>
                  <span className="font-mono text-slate-300">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={opacity}
                  onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}

            {/* Palette Swatches */}
            {presetSwatches.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
                  Presets
                </span>
                <div className="grid grid-cols-8 gap-1.5">
                  {presetSwatches.map((color, i) => (
                    <button
                      key={`${color}-${i}`}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      title={color}
                      className="w-5 h-5 rounded-md border border-slate-700 hover:scale-115 transition-transform shadow-xs shrink-0"
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
