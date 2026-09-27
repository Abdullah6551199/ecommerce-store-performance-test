"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";

export interface VariantSelectorProps {
  id?: string;
  sectionId?: string;
  variant?: "pills" | "dropdown" | "swatches" | string;
  settings?: {
    label?: string;
    options_list?: string;
  };
  selected?: string;
  onSelect?: (val: string) => void;
}

export function VariantSelector({
  id = "variant_selector",
  sectionId,
  variant = "pills",
  settings = {},
  selected: controlledSelected,
  onSelect,
}: VariantSelectorProps) {
  const label = settings.label || "Select Size";
  const rawOptions = settings.options_list || "S, M, L, XL";
  const options = rawOptions.split(",").map((s) => s.trim()).filter(Boolean);

  const [internalSelected, setInternalSelected] = useState(options[0] || "");
  const current = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const handleSelect = (val: string) => {
    setInternalSelected(val);
    onSelect?.(val);
  };

  const isDropdown = variant === "dropdown";

  return (
    <EditableComponent
      id={id}
      type="variant_selector"
      sectionId={sectionId}
      className="space-y-2 my-2"
    >
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--theme-text,#18181B)]">
        <span>{label}</span>
        <span className="text-[var(--theme-text-muted,#71717A)] font-normal">{current}</span>
      </div>

      {isDropdown ? (
        <select
          value={current}
          onChange={(e) => handleSelect(e.target.value)}
          className="w-full px-3 py-2 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] text-xs text-[var(--theme-text,#18181B)]"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`px-4 py-2 rounded-[var(--theme-radius,8px)] text-xs font-semibold border transition-all ${
                current === opt
                  ? "border-[var(--theme-primary,#18181B)] bg-[var(--theme-primary,#18181B)] text-white shadow-xs"
                  : "border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)] hover:border-black"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </EditableComponent>
  );
}

export default VariantSelector;
