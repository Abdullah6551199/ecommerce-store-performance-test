"use client";

import React from "react";

export type SizeUnit = "px" | "rem" | "em" | "%" | "vw" | "vh";

export interface SizeValue {
  value: number;
  unit: SizeUnit;
}

interface SizeControlProps {
  label: string;
  value?: SizeValue | number | string;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  defaultUnit?: SizeUnit;
  allowedUnits?: SizeUnit[];
  description?: string;
}

export function parseSizeString(val?: string | number | SizeValue): { num: number; unit: SizeUnit } {
  if (typeof val === "object" && val !== null && "value" in val) {
    return { num: val.value, unit: val.unit || "px" };
  }
  if (typeof val === "number") {
    return { num: val, unit: "px" };
  }
  if (!val || typeof val !== "string") {
    return { num: 0, unit: "px" };
  }
  const match = val.match(/^(-?[\d.]+)\s*(px|rem|em|%|vw|vh)?$/i);
  if (match) {
    return {
      num: parseFloat(match[1]) || 0,
      unit: (match[2]?.toLowerCase() as SizeUnit) || "px",
    };
  }
  return { num: parseFloat(val) || 0, unit: "px" };
}

export function SizeControl({
  label,
  value,
  onChange,
  min = 0,
  max = 200,
  step = 1,
  defaultValue = 16,
  defaultUnit = "px",
  allowedUnits = ["px", "rem", "em", "%", "vw", "vh"],
  description,
}: SizeControlProps) {
  const parsed = parseSizeString(value);
  const currentNum = isNaN(parsed.num) ? defaultValue : parsed.num;
  const currentUnit = parsed.unit || defaultUnit;

  const emit = (n: number, u: SizeUnit) => {
    onChange(`${n}${u}`);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseFloat(e.target.value);
    emit(n, currentUnit);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseFloat(e.target.value) || 0;
    emit(n, currentUnit);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const u = e.target.value as SizeUnit;
    emit(currentNum, u);
  };

  const handleIncrement = () => {
    emit(Math.min(max, currentNum + step), currentUnit);
  };

  const handleDecrement = () => {
    emit(Math.max(min, currentNum - step), currentUnit);
  };

  const handleReset = () => {
    emit(defaultValue, defaultUnit);
  };

  return (
    <div className="space-y-1.5 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <label className="font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-1.5">
          {description && <span className="text-[10px] text-slate-500">{description}</span>}
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default"
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentNum}
          onChange={handleSliderChange}
          className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
        />

        {/* Number Input + Increment/Decrement Buttons */}
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded overflow-hidden">
          <input
            type="number"
            value={currentNum}
            onChange={handleNumberChange}
            min={min}
            max={max}
            step={step}
            className="w-14 bg-transparent px-1.5 py-1 text-right text-xs text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="flex flex-col border-l border-slate-700 bg-slate-800">
            <button
              type="button"
              onClick={handleIncrement}
              className="px-1 text-[8px] text-slate-400 hover:text-white hover:bg-slate-700 leading-none h-3 flex items-center justify-center"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="px-1 text-[8px] text-slate-400 hover:text-white hover:bg-slate-700 leading-none h-3 flex items-center justify-center border-t border-slate-700"
            >
              ▼
            </button>
          </div>
        </div>

        {/* Unit Select with explicit dark background options */}
        <select
          value={currentUnit}
          onChange={handleUnitChange}
          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
        >
          {allowedUnits.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
        <span>{min}{currentUnit}</span>
        <span>{max}{currentUnit}</span>
      </div>
    </div>
  );
}

export default SizeControl;
