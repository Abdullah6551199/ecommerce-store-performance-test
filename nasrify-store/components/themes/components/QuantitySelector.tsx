"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";

export interface QuantitySelectorProps {
  id?: string;
  sectionId?: string;
  settings?: {
    min?: number;
    max?: number;
    step?: number;
  };
  value?: number;
  onChange?: (quantity: number) => void;
}

export function QuantitySelector({
  id = "quantity_selector",
  sectionId,
  settings = {},
  value: controlledValue,
  onChange,
}: QuantitySelectorProps) {
  const min = settings.min ?? 1;
  const max = settings.max ?? 99;
  const step = settings.step ?? 1;

  const [internalQty, setInternalQty] = useState(min);
  const qty = controlledValue !== undefined ? controlledValue : internalQty;

  const updateQty = (newQty: number) => {
    const clamped = Math.min(max, Math.max(min, newQty));
    setInternalQty(clamped);
    onChange?.(clamped);
  };

  return (
    <EditableComponent
      id={id}
      type="quantity_selector"
      sectionId={sectionId}
      className="inline-flex items-center border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] bg-[var(--theme-background,#FFFFFF)] shadow-2xs my-2"
    >
      <button
        type="button"
        onClick={() => updateQty(qty - step)}
        disabled={qty <= min}
        className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[var(--theme-text,#18181B)] hover:bg-[var(--theme-surface,#F4F4F5)] disabled:opacity-30 transition-colors"
      >
        −
      </button>
      <span className="w-10 text-center font-bold text-xs sm:text-sm text-[var(--theme-text,#18181B)]">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => updateQty(qty + step)}
        disabled={qty >= max}
        className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[var(--theme-text,#18181B)] hover:bg-[var(--theme-surface,#F4F4F5)] disabled:opacity-30 transition-colors"
      >
        +
      </button>
    </EditableComponent>
  );
}

export default QuantitySelector;
