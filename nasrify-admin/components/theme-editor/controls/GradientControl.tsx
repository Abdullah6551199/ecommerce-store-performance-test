"use client";

import React, { useState } from "react";

export type GradientType = "linear" | "radial" | "conic";

export interface ColorStop {
  id: string;
  color: string;
  position: number; // 0 - 100
}

export interface GradientConfig {
  type: GradientType;
  angle: number; // 0 - 360
  stops: ColorStop[];
}

interface GradientControlProps {
  label: string;
  value?: GradientConfig | string;
  onChange: (gradient: GradientConfig | string) => void;
  outputFormat?: "object" | "cssString";
}

const PRESET_GRADIENTS: Array<{ name: string; config: GradientConfig }> = [
  {
    name: "Emerald Glow",
    config: {
      type: "linear",
      angle: 135,
      stops: [
        { id: "1", color: "#25D366", position: 0 },
        { id: "2", color: "#10B981", position: 100 },
      ],
    },
  },
  {
    name: "Neon Cyber",
    config: {
      type: "linear",
      angle: 90,
      stops: [
        { id: "1", color: "#3B82F6", position: 0 },
        { id: "2", color: "#8B5CF6", position: 50 },
        { id: "3", color: "#EC4899", position: 100 },
      ],
    },
  },
  {
    name: "Sunset Blaze",
    config: {
      type: "linear",
      angle: 45,
      stops: [
        { id: "1", color: "#F59E0B", position: 0 },
        { id: "2", color: "#EF4444", position: 50 },
        { id: "3", color: "#7C3AED", position: 100 },
      ],
    },
  },
  {
    name: "Deep Midnight",
    config: {
      type: "linear",
      angle: 180,
      stops: [
        { id: "1", color: "#0F172A", position: 0 },
        { id: "2", color: "#1E293B", position: 50 },
        { id: "3", color: "#020617", position: 100 },
      ],
    },
  },
  {
    name: "Golden Luxury",
    config: {
      type: "linear",
      angle: 120,
      stops: [
        { id: "1", color: "#FDE68A", position: 0 },
        { id: "2", color: "#D97706", position: 50 },
        { id: "3", color: "#78350F", position: 100 },
      ],
    },
  },
  {
    name: "Radial Glow",
    config: {
      type: "radial",
      angle: 0,
      stops: [
        { id: "1", color: "#25D366", position: 0 },
        { id: "2", color: "#064E3B", position: 70 },
        { id: "3", color: "#022C22", position: 100 },
      ],
    },
  },
  {
    name: "Conic Spectrum",
    config: {
      type: "conic",
      angle: 0,
      stops: [
        { id: "1", color: "#EF4444", position: 0 },
        { id: "2", color: "#F59E0B", position: 25 },
        { id: "3", color: "#10B981", position: 50 },
        { id: "4", color: "#3B82F6", position: 75 },
        { id: "5", color: "#EF4444", position: 100 },
      ],
    },
  },
  {
    name: "Pastel Dream",
    config: {
      type: "linear",
      angle: 135,
      stops: [
        { id: "1", color: "#A7F3D0", position: 0 },
        { id: "2", color: "#BAE6FD", position: 50 },
        { id: "3", color: "#DDD6FE", position: 100 },
      ],
    },
  },
  {
    name: "Dark Amethyst",
    config: {
      type: "linear",
      angle: 90,
      stops: [
        { id: "1", color: "#2E1065", position: 0 },
        { id: "2", color: "#581C87", position: 50 },
        { id: "3", color: "#3B0764", position: 100 },
      ],
    },
  },
  {
    name: "Aurora Borealis",
    config: {
      type: "linear",
      angle: 60,
      stops: [
        { id: "1", color: "#059669", position: 0 },
        { id: "2", color: "#0284C7", position: 35 },
        { id: "3", color: "#6366F1", position: 70 },
        { id: "4", color: "#C026D3", position: 100 },
      ],
    },
  },
];

export function buildGradientCss(g: GradientConfig): string {
  const sortedStops = [...g.stops].sort((a, b) => a.position - b.position);
  const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(", ");

  if (g.type === "radial") {
    return `radial-gradient(circle at center, ${stopsStr})`;
  }
  if (g.type === "conic") {
    return `conic-gradient(from ${g.angle}deg at center, ${stopsStr})`;
  }
  return `linear-gradient(${g.angle}deg, ${stopsStr})`;
}

export function parseGradientConfig(val?: GradientConfig | string): GradientConfig {
  if (typeof val === "object" && val !== null && "stops" in val && Array.isArray(val.stops)) {
    return val;
  }
  return {
    type: "linear",
    angle: 90,
    stops: [
      { id: "stop_1", color: "#25D366", position: 0 },
      { id: "stop_2", color: "#18181B", position: 100 },
    ],
  };
}

export function GradientControl({
  label,
  value,
  onChange,
  outputFormat = "object",
}: GradientControlProps) {
  const gradient = parseGradientConfig(value);
  const [copied, setCopied] = useState(false);

  const emit = (newConfig: GradientConfig) => {
    if (outputFormat === "cssString") {
      onChange(buildGradientCss(newConfig));
    } else {
      onChange(newConfig);
    }
  };

  const handleTypeChange = (type: GradientType) => {
    emit({ ...gradient, type });
  };

  const handleAngleChange = (angle: number) => {
    emit({ ...gradient, angle });
  };

  const handleColorChange = (stopId: string, color: string) => {
    const stops = gradient.stops.map((s) => (s.id === stopId ? { ...s, color } : s));
    emit({ ...gradient, stops });
  };

  const handlePositionChange = (stopId: string, position: number) => {
    const stops = gradient.stops.map((s) => (s.id === stopId ? { ...s, position } : s));
    emit({ ...gradient, stops });
  };

  const handleAddColor = () => {
    if (gradient.stops.length >= 20) return;
    const colors = ["#EC4899", "#8B5CF6", "#3B82F6", "#F59E0B", "#10B981", "#06B6D4"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newStop: ColorStop = {
      id: `stop_${Date.now()}`,
      color: randomColor,
      position: Math.round(50 + (Math.random() * 20 - 10)),
    };
    emit({ ...gradient, stops: [...gradient.stops, newStop] });
  };

  const handleRemoveColor = (stopId: string) => {
    if (gradient.stops.length <= 2) return; // Minimum 2 colors
    const stops = gradient.stops.filter((s) => s.id !== stopId);
    emit({ ...gradient, stops });
  };

  const cssString = buildGradientCss(gradient);

  const handleCopyCss = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`background: ${cssString};`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <label className="font-medium text-slate-300">{label}</label>
        <button
          type="button"
          onClick={handleCopyCss}
          className="text-[10px] text-slate-400 hover:text-white transition-colors"
        >
          {copied ? "Copied ✓" : "Copy CSS"}
        </button>
      </div>

      {/* Live Preview Bar */}
      <div
        className="w-full h-8 rounded-lg border border-slate-700 shadow-inner"
        style={{ background: cssString }}
      />

      {/* Gradient Type Tabs */}
      <div className="flex rounded-md bg-slate-900 p-0.5 border border-slate-700">
        {(["linear", "radial", "conic"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`flex-1 py-1 rounded text-center text-[11px] capitalize transition-colors ${
              gradient.type === t
                ? "bg-slate-800 text-[#25D366] font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Angle Slider (for linear & conic) */}
      {gradient.type !== "radial" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Angle</span>
            <span className="font-mono text-slate-300">{gradient.angle}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={gradient.angle}
            onChange={(e) => handleAngleChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
          />
        </div>
      )}

      {/* Color Stops List (Unlimited Colors, Min 2, Max 20) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">
            Colors ({gradient.stops.length})
          </span>
          {gradient.stops.length < 20 && (
            <button
              type="button"
              onClick={handleAddColor}
              className="text-[10px] text-[#25D366] hover:underline font-medium"
            >
              + Add Color
            </button>
          )}
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {gradient.stops.map((stop, index) => (
            <div
              key={stop.id}
              className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded p-1.5"
            >
              {/* Native Color Picker */}
              <div className="relative w-6 h-6 rounded border border-slate-600 overflow-hidden shrink-0 shadow-xs">
                <input
                  type="color"
                  value={stop.color.startsWith("#") ? stop.color : "#25D366"}
                  onChange={(e) => handleColorChange(stop.id, e.target.value)}
                  className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
                />
                <div className="w-full h-full" style={{ backgroundColor: stop.color }} />
              </div>

              {/* Hex Input */}
              <input
                type="text"
                value={stop.color}
                onChange={(e) => handleColorChange(stop.id, e.target.value)}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-[#25D366]"
              />

              {/* Position Slider */}
              <input
                type="range"
                min={0}
                max={100}
                value={stop.position}
                onChange={(e) => handlePositionChange(stop.id, parseInt(e.target.value, 10))}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
              />
              <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
                {stop.position}%
              </span>

              {/* Remove (if > 2 stops) */}
              {gradient.stops.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveColor(stop.id)}
                  title="Remove color stop"
                  className="text-slate-500 hover:text-red-400 p-0.5 text-xs transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preset Gradients (10 built-in) */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800">
        <span className="text-[10px] font-medium uppercase font-mono text-slate-500">
          Presets
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          {PRESET_GRADIENTS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => emit(p.config)}
              title={p.name}
              className="h-6 rounded border border-slate-700 hover:scale-105 hover:border-[#25D366] transition-all shadow-xs"
              style={{ background: buildGradientCss(p.config) }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GradientControl;
