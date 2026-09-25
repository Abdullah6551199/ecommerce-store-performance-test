"use client";

import React, { useState } from "react";
import { GradientControl, GradientConfig, parseGradientConfig } from "./GradientControl";

export interface BorderConfig {
  style: "none" | "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "gradient";
  width: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    linked: boolean;
    unit: "px" | "rem" | "em";
  };
  color: string;
  gradient?: GradientConfig;
  radius: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
    linked: boolean;
    unit: "px" | "%" | "rem";
  };
  animation?: "none" | "pulse" | "glow" | "march" | "rotate-gradient";
  animationDuration?: number; // ms
}

export const DEFAULT_BORDER_CONFIG: BorderConfig = {
  style: "none",
  width: { top: 1, right: 1, bottom: 1, left: 1, linked: true, unit: "px" },
  color: "#334155",
  radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, linked: true, unit: "px" },
  animation: "none",
  animationDuration: 2000,
};

interface BorderControlProps {
  label?: string;
  value?: Partial<BorderConfig>;
  onChange: (cfg: BorderConfig) => void;
  description?: string;
}

export function BorderControl({
  label = "Border & Corner Radius",
  value,
  onChange,
  description,
}: BorderControlProps) {
  const config: BorderConfig = {
    ...DEFAULT_BORDER_CONFIG,
    ...value,
    width: { ...DEFAULT_BORDER_CONFIG.width, ...value?.width },
    radius: { ...DEFAULT_BORDER_CONFIG.radius, ...value?.radius },
  };

  const [activeTab, setActiveTab] = useState<"border" | "radius" | "animation">("border");

  const update = (partial: Partial<BorderConfig>) => {
    onChange({ ...config, ...partial });
  };

  const handleWidthChange = (side: "top" | "right" | "bottom" | "left", val: number) => {
    const num = Math.max(0, val || 0);
    if (config.width.linked) {
      update({
        width: { ...config.width, top: num, right: num, bottom: num, left: num },
      });
    } else {
      update({
        width: { ...config.width, [side]: num },
      });
    }
  };

  const handleRadiusChange = (
    corner: "topLeft" | "topRight" | "bottomRight" | "bottomLeft",
    val: number
  ) => {
    const num = Math.max(0, val || 0);
    if (config.radius.linked) {
      update({
        radius: {
          ...config.radius,
          topLeft: num,
          topRight: num,
          bottomRight: num,
          bottomLeft: num,
        },
      });
    } else {
      update({
        radius: { ...config.radius, [corner]: num },
      });
    }
  };

  return (
    <div className="space-y-4 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            {label}
          </label>
          {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
        </div>
        <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("border")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "border"
                ? "bg-slate-800 text-green-400 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Border
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("radius")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "radius"
                ? "bg-slate-800 text-green-400 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Radius
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("animation")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "animation"
                ? "bg-slate-800 text-green-400 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Anim
          </button>
        </div>
      </div>

      {activeTab === "border" && (
        <div className="space-y-3 pt-1">
          {/* Style Selector */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Border Style</span>
              <span className="font-mono text-slate-300 capitalize">{config.style}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(["none", "solid", "dashed", "dotted", "double", "groove", "ridge", "gradient"] as const).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => update({ style: st })}
                    className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition-all capitalize ${
                      config.style === st
                        ? "bg-green-500/20 text-green-400 border-green-500/50 shadow-sm"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {config.style !== "none" && (
            <>
              {/* Width inputs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Border Width ({config.width.unit})</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          width: { ...config.width, linked: !config.width.linked },
                        })
                      }
                      title={config.width.linked ? "Unlink sides" : "Link all sides"}
                      className={`p-1 rounded text-xs transition-colors ${
                        config.width.linked
                          ? "bg-green-500/20 text-green-400 border border-green-500/40"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      🔗
                    </button>
                    <select
                      value={config.width.unit}
                      onChange={(e) =>
                        update({
                          width: {
                            ...config.width,
                            unit: e.target.value as "px" | "rem" | "em",
                          },
                        })
                      }
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-1.5 py-0.5 [&>option]:bg-slate-900 [&>option]:text-slate-100"
                    >
                      <option value="px">px</option>
                      <option value="rem">rem</option>
                      <option value="em">em</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <div key={side} className="space-y-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={config.width[side]}
                        onChange={(e) => handleWidthChange(side, parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-1.5 text-center text-xs font-mono text-slate-200 focus:outline-none focus:border-green-500"
                      />
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                        {side[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color or Gradient */}
              {config.style === "gradient" ? (
                <div className="pt-2 border-t border-slate-800/80">
                  <GradientControl
                    label="Border Gradient"
                    value={config.gradient}
                    onChange={(grad) =>
                      update({ gradient: typeof grad === "string" ? parseGradientConfig(grad) : grad })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Border Color</span>
                    <span className="font-mono text-slate-300 text-[11px]">{config.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.color.startsWith("#") ? config.color : "#334155"}
                      onChange={(e) => update({ color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={config.color}
                      onChange={(e) => update({ color: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-green-500"
                      placeholder="#334155"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "radius" && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Corner Radius ({config.radius.unit})</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  update({
                    radius: { ...config.radius, linked: !config.radius.linked },
                  })
                }
                title={config.radius.linked ? "Unlink corners" : "Link all corners"}
                className={`p-1 rounded text-xs transition-colors ${
                  config.radius.linked
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                🔗
              </button>
              <select
                value={config.radius.unit}
                onChange={(e) =>
                  update({
                    radius: {
                      ...config.radius,
                      unit: e.target.value as "px" | "%" | "rem",
                    },
                  })
                }
                className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-1.5 py-0.5 [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="px">px</option>
                <option value="%">%</option>
                <option value="rem">rem</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: "topLeft", label: "TL" },
              { id: "topRight", label: "TR" },
              { id: "bottomRight", label: "BR" },
              { id: "bottomLeft", label: "BL" },
            ].map(({ id, label: lbl }) => (
              <div key={id} className="space-y-1 text-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.radius[id as keyof typeof config.radius] as number}
                  onChange={(e) =>
                    handleRadiusChange(
                      id as "topLeft" | "topRight" | "bottomRight" | "bottomLeft",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-1.5 text-center text-xs font-mono text-slate-200 focus:outline-none focus:border-green-500"
                />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  {lbl}
                </span>
              </div>
            ))}
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500">Presets:</span>
            {[0, 4, 8, 12, 16, 9999].map((rad) => (
              <button
                key={rad}
                type="button"
                onClick={() =>
                  update({
                    radius: {
                      ...config.radius,
                      topLeft: rad,
                      topRight: rad,
                      bottomRight: rad,
                      bottomLeft: rad,
                      unit: "px",
                    },
                  })
                }
                className="px-2 py-0.5 text-[10px] bg-slate-950 border border-slate-800 rounded hover:border-slate-700 text-slate-400 hover:text-slate-200"
              >
                {rad === 9999 ? "Full" : `${rad}px`}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "animation" && (
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Border Animation</span>
              <span className="font-mono text-slate-300 capitalize">{config.animation || "none"}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "none", label: "None" },
                { id: "pulse", label: "Pulse" },
                { id: "glow", label: "Glow" },
                { id: "march", label: "Marching Ants" },
                { id: "rotate-gradient", label: "Rotating Gradient" },
              ].map(({ id, label: lbl }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update({ animation: id as any })}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition-all ${
                    config.animation === id
                      ? "bg-green-500/20 text-green-400 border-green-500/50"
                      : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {config.animation && config.animation !== "none" && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Speed / Duration</span>
                <span className="font-mono text-slate-300">
                  {((config.animationDuration || 2000) / 1000).toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="6000"
                step="250"
                value={config.animationDuration || 2000}
                onChange={(e) => update({ animationDuration: parseInt(e.target.value) })}
                className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Visual Live Preview Box */}
      <div className="pt-2">
        <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Preview</div>
        <div className="w-full h-12 bg-slate-950/90 rounded-lg flex items-center justify-center border border-slate-800 overflow-hidden">
          <div
            className="w-3/4 h-8 flex items-center justify-center text-[11px] text-slate-300 font-mono transition-all duration-300"
            style={{
              borderStyle: config.style === "gradient" ? "solid" : config.style,
              borderTopWidth: `${config.width.top}${config.width.unit}`,
              borderRightWidth: `${config.width.right}${config.width.unit}`,
              borderBottomWidth: `${config.width.bottom}${config.width.unit}`,
              borderLeftWidth: `${config.width.left}${config.width.unit}`,
              borderColor: config.color,
              borderTopLeftRadius: `${config.radius.topLeft}${config.radius.unit}`,
              borderTopRightRadius: `${config.radius.topRight}${config.radius.unit}`,
              borderBottomRightRadius: `${config.radius.bottomRight}${config.radius.unit}`,
              borderBottomLeftRadius: `${config.radius.bottomLeft}${config.radius.unit}`,
            }}
          >
            Sample Element
          </div>
        </div>
      </div>
    </div>
  );
}
