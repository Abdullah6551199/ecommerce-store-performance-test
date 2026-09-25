"use client";

import React, { useState } from "react";
import { FontPicker } from "../FontPicker";
import { SizeControl } from "./SizeControl";
import { ColorControl } from "./ColorControl";

export interface TypographyConfig {
  fontFamily?: string;
  fontWeight?: string | number;
  fontSize?: string;
  lineHeight?: string;
  letterSpacing?: string;
  wordSpacing?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: "none" | "underline" | "line-through";
  fontStyle?: "normal" | "italic" | "oblique";
  textAlign?: "left" | "center" | "right" | "justify";
  color?: string;
}

export const DEFAULT_TYPOGRAPHY_CONFIG: TypographyConfig = {
  fontFamily: "Inter",
  fontWeight: "400",
  fontSize: "16px",
  lineHeight: "1.5",
  letterSpacing: "0px",
  wordSpacing: "0px",
  textTransform: "none",
  textDecoration: "none",
  fontStyle: "normal",
  textAlign: "left",
  color: "#FFFFFF",
};

interface TypographyControlProps {
  label?: string;
  value?: Partial<TypographyConfig>;
  onChange: (cfg: TypographyConfig) => void;
  description?: string;
  showColor?: boolean;
}

export function TypographyControl({
  label = "Typography",
  value,
  onChange,
  description,
  showColor = true,
}: TypographyControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const config: TypographyConfig = {
    ...DEFAULT_TYPOGRAPHY_CONFIG,
    ...value,
  };

  const update = (partial: Partial<TypographyConfig>) => {
    onChange({ ...config, ...partial });
  };

  const weights = [
    { label: "100 Thin", val: "100" },
    { label: "200 Extra Light", val: "200" },
    { label: "300 Light", val: "300" },
    { label: "400 Regular", val: "400" },
    { label: "500 Medium", val: "500" },
    { label: "600 Semi Bold", val: "600" },
    { label: "700 Bold", val: "700" },
    { label: "800 Extra Bold", val: "800" },
    { label: "900 Black", val: "900" },
  ];

  return (
    <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            {label}
          </label>
          {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
        >
          <span>{config.fontFamily || "Inter"}</span>
          <span className="text-slate-400 font-mono text-[10px]">{config.fontSize}</span>
          <span className="text-xs text-slate-400">{isOpen ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Main inline summary view */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/80">
        <span className="truncate max-w-[150px] font-medium text-slate-300">
          {config.fontFamily}, {config.fontWeight}
        </span>
        <div className="flex items-center gap-2">
          {showColor && config.color && (
            <div
              className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
              style={{ backgroundColor: config.color }}
              title={config.color}
            />
          )}
          <span className="font-mono text-slate-400 text-[11px]">
            {config.textAlign?.slice(0, 1).toUpperCase()} · {config.textTransform || "none"}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
          {/* Font Family Picker */}
          <div>
            <FontPicker
              label="Font Family"
              value={config.fontFamily || "Inter"}
              onChange={(fam) => update({ fontFamily: fam })}
            />
          </div>

          {/* Font Weight & Style */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Weight</label>
              <select
                value={String(config.fontWeight || "400")}
                onChange={(e) => update({ fontWeight: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                {weights.map((w) => (
                  <option key={w.val} value={w.val}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Style</label>
              <div className="grid grid-cols-3 gap-1">
                {(["normal", "italic", "oblique"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => update({ fontStyle: st })}
                    className={`py-1.5 text-center text-xs rounded-lg border transition-colors capitalize ${
                      config.fontStyle === st
                        ? "bg-green-500/20 text-green-400 border-green-500/40"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {st === "normal" ? "Norm" : st === "italic" ? "Italic" : "Obl"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Font Size & Line Height */}
          <div className="space-y-2">
            <SizeControl
              label="Font Size"
              value={config.fontSize || "16px"}
              onChange={(sz) => update({ fontSize: sz })}
              min={8}
              max={120}
              defaultValue={16}
            />
            <SizeControl
              label="Line Height"
              value={config.lineHeight || "1.5"}
              onChange={(lh) => update({ lineHeight: lh })}
              min={0.5}
              max={4}
              step={0.1}
              defaultValue={1.5}
              defaultUnit="em"
              allowedUnits={["em", "px", "%"]}
            />
            <SizeControl
              label="Letter Spacing"
              value={config.letterSpacing || "0px"}
              onChange={(ls) => update({ letterSpacing: ls })}
              min={-5}
              max={20}
              step={0.5}
              defaultValue={0}
            />
          </div>

          {/* Text Alignment */}
          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">Text Alignment</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: "left", label: "Left", icon: "⇤" },
                { id: "center", label: "Center", icon: "↔" },
                { id: "right", label: "Right", icon: "⇥" },
                { id: "justify", label: "Justify", icon: "☰" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update({ textAlign: item.id as any })}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                    config.textAlign === item.id
                      ? "bg-green-500/20 text-green-400 border-green-500/40"
                      : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Transform & Decoration */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Transform</label>
              <select
                value={config.textTransform || "none"}
                onChange={(e) => update({ textTransform: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Decoration</label>
              <select
                value={config.textDecoration || "none"}
                onChange={(e) => update({ textDecoration: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="line-through">Line Through</option>
              </select>
            </div>
          </div>

          {/* Color */}
          {showColor && (
            <div className="pt-2 border-t border-slate-800">
              <ColorControl
                label="Text Color"
                value={config.color || "#FFFFFF"}
                onChange={(clr) => update({ color: clr })}
              />
            </div>
          )}

          {/* Live Preview Box */}
          <div className="pt-1">
            <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Preview</div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center overflow-hidden">
              <p
                style={{
                  fontFamily: config.fontFamily || "Inter",
                  fontWeight: config.fontWeight || "400",
                  fontSize: config.fontSize || "16px",
                  lineHeight: config.lineHeight || "1.5",
                  letterSpacing: config.letterSpacing || "0px",
                  wordSpacing: config.wordSpacing || "0px",
                  textTransform: config.textTransform || "none",
                  textDecoration: config.textDecoration || "none",
                  fontStyle: config.fontStyle || "normal",
                  textAlign: config.textAlign || "left",
                  color: config.color || "#FFFFFF",
                }}
              >
                The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
