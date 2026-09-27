"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";

export interface AddToCartBtnProps {
  id?: string;
  sectionId?: string;
  variant?: "primary" | "secondary" | "outline" | string;
  settings?: {
    text?: string;
    show_icon?: boolean;
  };
  onClick?: () => void;
}

export function AddToCartBtn({
  id = "add_to_cart_btn",
  sectionId,
  variant = "primary",
  settings = {},
  onClick,
}: AddToCartBtnProps) {
  const text = settings.text || "Add to Cart";
  const showIcon = settings.show_icon !== false;
  const [added, setAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    onClick?.();
  };

  const variantStyles: Record<string, string> = {
    primary:
      "bg-[var(--theme-primary,#18181B)] text-white hover:bg-[var(--theme-accent,#2563EB)] border-transparent",
    secondary:
      "bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text,#18181B)] hover:bg-slate-200 border-[var(--theme-border,#E4E4E7)]",
    outline:
      "bg-transparent text-[var(--theme-text,#18181B)] border-[var(--theme-border,#E4E4E7)] hover:border-black",
  };

  return (
    <EditableComponent id={id} type="add_to_cart_btn" sectionId={sectionId} className="my-2">
      <button
        type="button"
        onClick={handleClick}
        className={`w-full py-3 px-6 rounded-[var(--theme-radius,8px)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all shadow-xs ${
          variantStyles[variant] || variantStyles.primary
        }`}
      >
        {showIcon && <span>🛒</span>}
        <span>{added ? "✓ Added to Bag" : text}</span>
      </button>
    </EditableComponent>
  );
}

export default AddToCartBtn;
