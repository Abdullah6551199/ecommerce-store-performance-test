"use client";

import React, { useState } from "react";
import { SizeUnit } from "./SizeControl";

export interface SpacingValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: SizeUnit;
}

interface SpacingControlProps {
  label: string;
  value?: SpacingValues | string;
  onChange: (val: SpacingValues | string) => void;
  outputFormat?: "object" | "cssString";
  defaultUnit?: SizeUnit;
}

export function parseSpacingValue(val?: SpacingValues | string, defaultUnit: SizeUnit = "px"): SpacingValues {
  if (typeof val === "object" && val !== null && "top" in val) {
    return {
      top: Number(val.top) || 0,
      right: Number(val.right) || 0,
      bottom: Number(val.bottom) || 0,
      left: Number(val.left) || 0,
      unit: val.unit || defaultUnit,
    };
  }

  if (typeof val === "string" && val.trim()) {
    const parts = val.trim().split(/\s+/);
    const parseSide = (s?: string) => {
      if (!s) return 0;
      return parseFloat(s) || 0;
    };
    const unitMatch = val.match(/(px|rem|em|%|vw|vh)/i);
    const unit = (unitMatch ? unitMatch[1].toLowerCase() : defaultUnit) as SizeUnit;

    if (parts.length === 1) {
      const v = parseSide(parts[0]);
      return { top: v, right: v, bottom: v, left: v, unit };
    }
    if (parts.length === 2) {
      const tb = parseSide(parts[0]);
      const rl = parseSide(parts[1]);
      return { top: tb, right: rl, bottom: tb, left: rl, unit };
    }
    if (parts.length === 3) {
      return {
        top: parseSide(parts[0]),
        right: parseSide(parts[1]),
        bottom: parseSide(parts[2]),
        left: parseSide(parts[1]),
        unit,
      };
    }
    if (parts.length >= 4) {
      return {
        top: parseSide(parts[0]),
        right: parseSide(parts[1]),
        bottom: parseSide(parts[2]),
        left: parseSide(parts[3]),
        unit,
      };
    }
  }

  return { top: 0, right: 0, bottom: 0, left: 0, unit: defaultUnit };
}

export function SpacingControl({
  label,
  value,
  onChange,
  outputFormat = "object",
  defaultUnit = "px",
}: SpacingControlProps) {
  const parsed = parseSpacingValue(value, defaultUnit);
  const [isLinked, setIsLinked] = useState<boolean>(true);

  const emit = (newVals: SpacingValues) => {
    if (outputFormat === "cssString") {
      const { top, right, bottom, left, unit } = newVals;
      onChange(`${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`);
    } else {
      onChange(newVals);
    }
  };

  const handleSideChange = (side: "top" | "right" | "bottom" | "left", n: number) => {
    if (isLinked) {
      emit({ top: n, right: n, bottom: n, left: n, unit: parsed.unit });
    } else {
      emit({ ...parsed, [side]: n });
    }
  };

  const handleUnitChange = (u: SizeUnit) => {
    emit({ ...parsed, unit: u });
  };

  const handleReset = () => {
    emit({ top: 0, right: 0, bottom: 0, left: 0, unit: defaultUnit });
  };

  return (
    <div className="space-y-2 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <label className="font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-2">
          {/* Unit dropdown */}
          <select
            value={parsed.unit}
            onChange={(e) => handleUnitChange(e.target.value as SizeUnit)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
          >
            <option value="px">px</option>
            <option value="rem">rem</option>
            <option value="em">em</option>
            <option value="%">%</option>
          </select>

          {/* Link toggle */}
          <button
            type="button"
            onClick={() => setIsLinked(!isLinked)}
            title={isLinked ? "Unlink sides" : "Link all sides"}
            className={`p-1 rounded border transition-colors ${
              isLinked
                ? "bg-[#25D366]/20 border-[#25D366] text-[#25D366]"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isLinked ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              )}
            </svg>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            title="Reset to 0"
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 4 Inputs Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <div key={side} className="flex flex-col items-center">
            <input
              type="number"
              value={parsed[side]}
              onChange={(e) => handleSideChange(side, parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center text-xs text-slate-100 focus:outline-none focus:border-[#25D366]"
            />
            <span className="text-[10px] uppercase font-mono text-slate-500 mt-0.5">
              {side.charAt(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpacingControl;
