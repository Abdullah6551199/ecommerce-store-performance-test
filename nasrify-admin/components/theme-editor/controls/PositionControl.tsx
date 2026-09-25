"use client";

import React from "react";
import { SizeControl } from "./SizeControl";
import { ZIndexControl } from "./ZIndexControl";

export interface PositionConfig {
  type: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number | "auto";
}

export const DEFAULT_POSITION_CONFIG: PositionConfig = {
  type: "relative",
  top: "",
  right: "",
  bottom: "",
  left: "",
  zIndex: "auto",
};

interface PositionControlProps {
  label?: string;
  value?: Partial<PositionConfig>;
  onChange: (cfg: PositionConfig) => void;
  description?: string;
}

export function PositionControl({
  label = "Position & Z-Index",
  value,
  onChange,
  description,
}: PositionControlProps) {
  const config: PositionConfig = {
    ...DEFAULT_POSITION_CONFIG,
    ...value,
  };

  const update = (partial: Partial<PositionConfig>) => {
    onChange({ ...config, ...partial });
  };

  const types = ["static", "relative", "absolute", "fixed", "sticky"] as const;

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

      {config.type !== "static" && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 block font-medium">Offsets</span>
          <div className="grid grid-cols-2 gap-2">
            <SizeControl
              label="Top"
              value={config.top || "0px"}
              onChange={(val) => update({ top: val })}
              min={-200}
              max={500}
              defaultValue={0}
            />
            <SizeControl
              label="Right"
              value={config.right || "0px"}
              onChange={(val) => update({ right: val })}
              min={-200}
              max={500}
              defaultValue={0}
            />
            <SizeControl
              label="Bottom"
              value={config.bottom || "0px"}
              onChange={(val) => update({ bottom: val })}
              min={-200}
              max={500}
              defaultValue={0}
            />
            <SizeControl
              label="Left"
              value={config.left || "0px"}
              onChange={(val) => update({ left: val })}
              min={-200}
              max={500}
              defaultValue={0}
            />
          </div>
        </div>
      )}

      {/* Z-Index */}
      <div className="pt-2 border-t border-slate-800/80">
        <ZIndexControl
          label="Z-Index Layer"
          value={config.zIndex}
          onChange={(val) => update({ zIndex: val })}
        />
      </div>
    </div>
  );
}
