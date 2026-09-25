"use client";

import React from "react";

export interface ShadowLayer {
  id: string;
  type: "color" | "gradient";
  color: string;
  gradient?: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  inset: boolean;
}

interface ShadowControlProps {
  label?: string;
  value?: ShadowLayer[] | string;
  onChange: (val: ShadowLayer[] | string) => void;
  outputFormat?: "object" | "cssString";
  isTextShadow?: boolean;
}

export function buildBoxShadowCss(layers: ShadowLayer[]): string {
  if (!layers || layers.length === 0) return "none";
  return layers
    .map((l) => {
      const col = l.color || "rgba(0,0,0,0.15)";
      const insetValue = l.inset ? "inset " : "";
      return `${insetValue}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${col}`;
    })
    .join(", ");
}

export function buildTextShadowCss(layers: ShadowLayer[]): string {
  if (!layers || layers.length === 0) return "none";
  return layers
    .map((l) => {
      const col = l.color || "rgba(0,0,0,0.3)";
      return `${l.x}px ${l.y}px ${l.blur}px ${col}`;
    })
    .join(", ");
}

export function ShadowControl({
  label = "Box Shadows",
  value,
  onChange,
  outputFormat = "object",
  isTextShadow = false,
}: ShadowControlProps) {
  const layers: ShadowLayer[] = Array.isArray(value)
    ? value
    : [
        {
          id: "shadow_1",
          type: "color",
          color: "rgba(0, 0, 0, 0.12)",
          x: 0,
          y: 4,
          blur: 14,
          spread: 0,
          inset: false,
        },
      ];

  const emit = (newLayers: ShadowLayer[]) => {
    if (outputFormat === "cssString") {
      onChange(isTextShadow ? buildTextShadowCss(newLayers) : buildBoxShadowCss(newLayers));
    } else {
      onChange(newLayers);
    }
  };

  const handleAddLayer = () => {
    const newLayer: ShadowLayer = {
      id: `shadow_${Date.now()}`,
      type: "color",
      color: "rgba(0, 0, 0, 0.15)",
      x: 0,
      y: 8,
      blur: 20,
      spread: 0,
      inset: false,
    };
    emit([...layers, newLayer]);
  };

  const handleRemoveLayer = (id: string) => {
    emit(layers.filter((l) => l.id !== id));
  };

  const handleUpdateLayer = (id: string, patch: Partial<ShadowLayer>) => {
    emit(layers.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  return (
    <div className="space-y-3 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <label className="font-medium text-slate-300">{label}</label>
        <button
          type="button"
          onClick={handleAddLayer}
          className="text-[10px] text-[#25D366] hover:underline font-medium"
        >
          + Add Shadow Layer
        </button>
      </div>

      {/* Shadow Layers List */}
      <div className="space-y-2.5">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className="bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 space-y-2"
          >
            {/* Layer Header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-200">
                Layer {index + 1}
              </span>
              <div className="flex items-center gap-2">
                {!isTextShadow && (
                  <button
                    type="button"
                    onClick={() => handleUpdateLayer(layer.id, { inset: !layer.inset })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                      layer.inset
                        ? "bg-[#25D366]/20 border-[#25D366] text-[#25D366]"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {layer.inset ? "Inset ✓" : "Outset"}
                  </button>
                )}
                {layers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLayer(layer.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
                    title="Delete layer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Color Input */}
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded border border-slate-700 overflow-hidden shrink-0 shadow-xs">
                <input
                  type="color"
                  value={layer.color.startsWith("#") ? layer.color : "#000000"}
                  onChange={(e) => handleUpdateLayer(layer.id, { color: e.target.value })}
                  className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
                />
                <div className="w-full h-full" style={{ backgroundColor: layer.color }} />
              </div>
              <input
                type="text"
                value={layer.color}
                onChange={(e) => handleUpdateLayer(layer.id, { color: e.target.value })}
                placeholder="rgba(0,0,0,0.2) or #HEX"
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#25D366]"
              />
            </div>

            {/* Offset X & Y Sliders */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>X Offset</span>
                  <span className="font-mono">{layer.x}px</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={layer.x}
                  onChange={(e) => handleUpdateLayer(layer.id, { x: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Y Offset</span>
                  <span className="font-mono">{layer.y}px</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={layer.y}
                  onChange={(e) => handleUpdateLayer(layer.id, { y: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
                />
              </div>
            </div>

            {/* Blur & Spread */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Blur</span>
                  <span className="font-mono">{layer.blur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={layer.blur}
                  onChange={(e) => handleUpdateLayer(layer.id, { blur: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
                />
              </div>

              {!isTextShadow && (
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Spread</span>
                    <span className="font-mono">{layer.spread}px</span>
                  </div>
                  <input
                    type="range"
                    min={-20}
                    max={50}
                    value={layer.spread}
                    onChange={(e) => handleUpdateLayer(layer.id, { spread: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShadowControl;
