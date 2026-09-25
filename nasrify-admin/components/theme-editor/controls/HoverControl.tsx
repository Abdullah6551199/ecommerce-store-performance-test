"use client";

import React, { useState } from "react";

export interface HoverConfig {
  enabled: boolean;
  scale?: number; // 0.5 - 2, default 1
  rotate?: number; // -180 to 180 deg, default 0
  translateX?: number; // -100 to 100px
  translateY?: number; // -100 to 100px
  opacity?: number; // 0 to 1, default 1
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  shadowPreset?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "glow-green" | "glow-blue" | "glow-amber";
  duration?: number; // ms, default 300
  easing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
}

export const DEFAULT_HOVER_CONFIG: HoverConfig = {
  enabled: false,
  scale: 1,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  opacity: 1,
  backgroundColor: "",
  textColor: "",
  borderColor: "",
  shadowPreset: "none",
  duration: 300,
  easing: "ease-out",
};

const SHADOW_PRESETS: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
  "glow-green": "0 0 20px rgba(34, 197, 94, 0.5)",
  "glow-blue": "0 0 20px rgba(59, 130, 246, 0.5)",
  "glow-amber": "0 0 20px rgba(245, 158, 11, 0.5)",
};

interface HoverControlProps {
  label?: string;
  value?: Partial<HoverConfig>;
  onChange: (cfg: HoverConfig) => void;
  description?: string;
}

export function HoverControl({
  label = "Hover Effects",
  value,
  onChange,
  description,
}: HoverControlProps) {
  const config: HoverConfig = {
    ...DEFAULT_HOVER_CONFIG,
    ...value,
  };

  const [isHoveringPreview, setIsHoveringPreview] = useState(false);

  const update = (partial: Partial<HoverConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            {label}
          </label>
          {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => update({ enabled: !config.enabled })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            config.enabled ? "bg-green-500" : "bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              config.enabled ? "translate-x-4.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {config.enabled && (
        <div className="space-y-3.5 pt-1">
          {/* Transform: Scale & Rotate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Scale</span>
                <span className="font-mono text-slate-300">{(config.scale || 1).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={config.scale ?? 1}
                onChange={(e) => update({ scale: parseFloat(e.target.value) })}
                className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rotate</span>
                <span className="font-mono text-slate-300">{config.rotate || 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={config.rotate || 0}
                onChange={(e) => update({ rotate: parseInt(e.target.value) })}
                className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Translation: X and Y */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Translate X</span>
                <span className="font-mono text-slate-300">{config.translateX || 0}px</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="2"
                value={config.translateX || 0}
                onChange={(e) => update({ translateX: parseInt(e.target.value) })}
                className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Translate Y (Lift)</span>
                <span className="font-mono text-slate-300">{config.translateY || 0}px</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="2"
                value={config.translateY || 0}
                onChange={(e) => update({ translateY: parseInt(e.target.value) })}
                className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Opacity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Hover Opacity</span>
              <span className="font-mono text-slate-300">
                {Math.round((config.opacity ?? 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={config.opacity ?? 1}
              onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Color overrides on hover */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs text-slate-400 font-medium block">Hover Colors</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Background</span>
                <input
                  type="text"
                  placeholder="#000000"
                  value={config.backgroundColor || ""}
                  onChange={(e) => update({ backgroundColor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Text Color</span>
                <input
                  type="text"
                  placeholder="#FFFFFF"
                  value={config.textColor || ""}
                  onChange={(e) => update({ textColor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Border Color</span>
                <input
                  type="text"
                  placeholder="#22C55E"
                  value={config.borderColor || ""}
                  onChange={(e) => update({ borderColor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Shadow preset on hover */}
          <div className="space-y-1 pt-1">
            <label className="text-xs text-slate-400 block">Hover Shadow</label>
            <select
              value={config.shadowPreset || "none"}
              onChange={(e) => update({ shadowPreset: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              <option value="none">None</option>
              <option value="sm">Small Shadow</option>
              <option value="md">Medium Shadow</option>
              <option value="lg">Large Shadow (Lift)</option>
              <option value="xl">Extra Large</option>
              <option value="2xl">2X Large Elevation</option>
              <option value="glow-green">Green Glow</option>
              <option value="glow-blue">Blue Glow</option>
              <option value="glow-amber">Amber Glow</option>
            </select>
          </div>

          {/* Transition settings */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Duration</span>
                <span className="font-mono text-slate-300">{config.duration || 300}ms</span>
              </div>
              <input
                type="range"
                min="50"
                max="1500"
                step="50"
                value={config.duration || 300}
                onChange={(e) => update({ duration: parseInt(e.target.value) })}
                className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">Easing</label>
              <select
                value={config.easing || "ease-out"}
                onChange={(e) => update({ easing: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="ease-out">Ease Out (Snappy)</option>
                <option value="ease">Ease</option>
                <option value="ease-in">Ease In</option>
                <option value="ease-in-out">Ease In-Out</option>
                <option value="linear">Linear</option>
              </select>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="pt-2">
            <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider flex justify-between">
              <span>Interactive Preview</span>
              <span>Hover the card below</span>
            </div>
            <div className="h-20 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
              <div
                onMouseEnter={() => setIsHoveringPreview(true)}
                onMouseLeave={() => setIsHoveringPreview(false)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 cursor-pointer select-none transition-all"
                style={{
                  transitionDuration: `${config.duration || 300}ms`,
                  transitionTimingFunction: config.easing || "ease-out",
                  transform: isHoveringPreview
                    ? `scale(${config.scale ?? 1}) rotate(${config.rotate || 0}deg) translate(${
                        config.translateX || 0
                      }px, ${config.translateY || 0}px)`
                    : "scale(1) rotate(0deg) translate(0px, 0px)",
                  opacity: isHoveringPreview ? config.opacity ?? 1 : 1,
                  backgroundColor:
                    isHoveringPreview && config.backgroundColor
                      ? config.backgroundColor
                      : undefined,
                  color: isHoveringPreview && config.textColor ? config.textColor : undefined,
                  borderColor:
                    isHoveringPreview && config.borderColor ? config.borderColor : undefined,
                  boxShadow:
                    isHoveringPreview && config.shadowPreset
                      ? SHADOW_PRESETS[config.shadowPreset]
                      : undefined,
                }}
              >
                Hover Me!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
