"use client";

import React, { useState } from "react";
import { ColorControl } from "./ColorControl";
import { GradientControl, GradientConfig, parseGradientConfig } from "./GradientControl";

export interface BackgroundConfig {
  type: "none" | "color" | "gradient" | "image" | "video";
  color?: string;
  gradient?: GradientConfig;
  image?: {
    url: string;
    fit: "cover" | "contain" | "fill" | "auto";
    position:
      | "center"
      | "top"
      | "bottom"
      | "left"
      | "right"
      | "top left"
      | "top right"
      | "bottom left"
      | "bottom right";
    repeat: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
    attachment: "scroll" | "fixed";
    parallax: boolean;
  };
  video?: {
    url: string;
    loop: boolean;
    muted: boolean;
    autoplay: boolean;
  };
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number; // 0 - 1
    blendMode: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
  };
}

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: "none",
  color: "#0F172A",
  image: {
    url: "",
    fit: "cover",
    position: "center",
    repeat: "no-repeat",
    attachment: "scroll",
    parallax: false,
  },
  video: {
    url: "",
    loop: true,
    muted: true,
    autoplay: true,
  },
  overlay: {
    enabled: false,
    color: "#000000",
    opacity: 0.5,
    blendMode: "normal",
  },
};

interface BackgroundControlProps {
  label?: string;
  value?: Partial<BackgroundConfig>;
  onChange: (cfg: BackgroundConfig) => void;
  description?: string;
}

export function BackgroundControl({
  label = "Background & Overlay",
  value,
  onChange,
  description,
}: BackgroundControlProps) {
  const config: BackgroundConfig = {
    ...DEFAULT_BACKGROUND_CONFIG,
    ...value,
    image: { ...DEFAULT_BACKGROUND_CONFIG.image!, ...value?.image },
    video: { ...DEFAULT_BACKGROUND_CONFIG.video!, ...value?.video },
    overlay: { ...DEFAULT_BACKGROUND_CONFIG.overlay!, ...value?.overlay },
  };

  const update = (partial: Partial<BackgroundConfig>) => {
    onChange({ ...config, ...partial });
  };

  const types = ["none", "color", "gradient", "image", "video"] as const;

  return (
    <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 space-y-3.5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            {label}
          </label>
          <span className="text-[11px] font-mono text-green-400 capitalize">{config.type}</span>
        </div>
        {description && <p className="text-[11px] text-slate-400 mb-2">{description}</p>}

        <div className="grid grid-cols-5 gap-1 pt-1">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update({ type: t })}
              className={`py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                config.type === t
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Classic Color */}
      {config.type === "color" && (
        <div className="pt-2 border-t border-slate-800/80">
          <ColorControl
            label="Background Color"
            value={config.color || "#0F172A"}
            onChange={(clr) => update({ color: clr })}
          />
        </div>
      )}

      {/* Unlimited Gradient */}
      {config.type === "gradient" && (
        <div className="pt-2 border-t border-slate-800/80">
          <GradientControl
            label="Background Gradient (Unlimited Colors)"
            value={config.gradient}
            onChange={(grad) =>
              update({ gradient: typeof grad === "string" ? parseGradientConfig(grad) : grad })
            }
          />
        </div>
      )}

      {/* Background Image */}
      {config.type === "image" && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Image URL</label>
            <input
              type="text"
              value={config.image?.url || ""}
              onChange={(e) =>
                update({
                  image: { ...config.image!, url: e.target.value },
                })
              }
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Fit</label>
              <select
                value={config.image?.fit || "cover"}
                onChange={(e) =>
                  update({
                    image: { ...config.image!, fit: e.target.value as any },
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill (Stretch)</option>
                <option value="auto">Auto (Original)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Position</label>
              <select
                value={config.image?.position || "center"}
                onChange={(e) =>
                  update({
                    image: { ...config.image!, position: e.target.value as any },
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="top left">Top Left</option>
                <option value="top right">Top Right</option>
                <option value="bottom left">Bottom Left</option>
                <option value="bottom right">Bottom Right</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Repeat</label>
              <select
                value={config.image?.repeat || "no-repeat"}
                onChange={(e) =>
                  update({
                    image: { ...config.image!, repeat: e.target.value as any },
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="no-repeat">No Repeat</option>
                <option value="repeat">Repeat Both</option>
                <option value="repeat-x">Repeat X</option>
                <option value="repeat-y">Repeat Y</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Attachment / Parallax</label>
              <select
                value={config.image?.parallax ? "parallax" : config.image?.attachment || "scroll"}
                onChange={(e) => {
                  const val = e.target.value;
                  update({
                    image: {
                      ...config.image!,
                      attachment: val === "fixed" ? "fixed" : "scroll",
                      parallax: val === "parallax",
                    },
                  });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="scroll">Scroll</option>
                <option value="fixed">Fixed</option>
                <option value="parallax">Parallax Effect</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Video Background */}
      {config.type === "video" && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Video MP4/WebM URL</label>
            <input
              type="text"
              value={config.video?.url || ""}
              onChange={(e) =>
                update({
                  video: { ...config.video!, url: e.target.value },
                })
              }
              placeholder="https://assets.mixkit.co/..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.video?.loop}
                onChange={(e) =>
                  update({
                    video: { ...config.video!, loop: e.target.checked },
                  })
                }
                className="rounded border-slate-700 bg-slate-950 text-green-500"
              />
              Loop
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.video?.muted}
                onChange={(e) =>
                  update({
                    video: { ...config.video!, muted: e.target.checked },
                  })
                }
                className="rounded border-slate-700 bg-slate-950 text-green-500"
              />
              Muted
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.video?.autoplay}
                onChange={(e) =>
                  update({
                    video: { ...config.video!, autoplay: e.target.checked },
                  })
                }
                className="rounded border-slate-700 bg-slate-950 text-green-500"
              />
              Autoplay
            </label>
          </div>
        </div>
      )}

      {/* Background Overlay (Applicable to Image, Video, or Gradient) */}
      {config.type !== "none" && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Background Overlay</span>
            <button
              type="button"
              onClick={() =>
                update({
                  overlay: { ...config.overlay!, enabled: !config.overlay?.enabled },
                })
              }
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                config.overlay?.enabled ? "bg-green-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                  config.overlay?.enabled ? "translate-x-3.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {config.overlay?.enabled && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.overlay.color}
                  onChange={(e) =>
                    update({
                      overlay: { ...config.overlay!, color: e.target.value },
                    })
                  }
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={config.overlay.color}
                  onChange={(e) =>
                    update({
                      overlay: { ...config.overlay!, color: e.target.value },
                    })
                  }
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                    <span>Opacity</span>
                    <span className="font-mono">{Math.round((config.overlay.opacity || 0.5) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.overlay.opacity}
                    onChange={(e) =>
                      update({
                        overlay: { ...config.overlay!, opacity: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full accent-green-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-0.5 block">Blend Mode</label>
                  <select
                    value={config.overlay.blendMode}
                    onChange={(e) =>
                      update({
                        overlay: { ...config.overlay!, blendMode: e.target.value as any },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded py-1 px-1.5 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
                  >
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="darken">Darken</option>
                    <option value="lighten">Lighten</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
