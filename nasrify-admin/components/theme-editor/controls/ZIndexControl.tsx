"use client";

import React from "react";

interface ZIndexControlProps {
  label?: string;
  value?: number | "auto";
  onChange: (val: number | "auto") => void;
  description?: string;
}

export function ZIndexControl({
  label = "Z-Index",
  value = "auto",
  onChange,
  description,
}: ZIndexControlProps) {
  const isAuto = value === "auto" || value === undefined;
  const numValue = typeof value === "number" ? value : 0;

  const presets = [
    { label: "Auto", val: "auto" as const },
    { label: "0", val: 0 },
    { label: "10", val: 10 },
    { label: "20", val: 20 },
    { label: "50", val: 50 },
    { label: "999", val: 999 },
  ];

  return (
    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
          {label}
        </label>
        <span className="font-mono text-xs text-green-400">
          {isAuto ? "auto" : numValue}
        </span>
      </div>

      {description && <p className="text-[11px] text-slate-400">{description}</p>}

      <div className="flex items-center gap-2">
        <div className="flex items-center flex-1 bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onChange(isAuto ? 0 : numValue - 1)}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border-r border-slate-800"
          >
            -
          </button>
          <input
            type="text"
            value={isAuto ? "auto" : String(numValue)}
            onChange={(e) => {
              const v = e.target.value.trim().toLowerCase();
              if (v === "auto" || v === "") {
                onChange("auto");
              } else {
                const parsed = parseInt(v);
                if (!isNaN(parsed)) onChange(parsed);
              }
            }}
            className="w-full bg-transparent text-center text-xs font-mono text-slate-200 py-1.5 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onChange(isAuto ? 1 : numValue + 1)}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border-l border-slate-800"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => onChange("auto")}
          className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
            isAuto
              ? "bg-green-500/20 text-green-400 border-green-500/40"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
          }`}
        >
          Auto
        </button>
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        <span className="text-[10px] text-slate-500">Presets:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange(p.val)}
            className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
              value === p.val
                ? "bg-green-500/20 text-green-400 border-green-500/40"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
