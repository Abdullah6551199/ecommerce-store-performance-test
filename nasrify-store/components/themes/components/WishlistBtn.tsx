"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";

export interface WishlistBtnProps {
  id?: string;
  sectionId?: string;
  settings?: {
    show_label?: boolean;
    label_text?: string;
  };
}

export function WishlistBtn({
  id = "wishlist_button",
  sectionId,
  settings = {},
}: WishlistBtnProps) {
  const showLabel = settings.show_label ?? false;
  const labelText = settings.label_text || "Save to Wishlist";
  const [active, setActive] = useState(false);

  return (
    <EditableComponent
      id={id}
      type="wishlist_button"
      sectionId={sectionId}
      className="inline-block my-1"
    >
      <button
        type="button"
        onClick={() => setActive(!active)}
        className="inline-flex items-center gap-2 p-2.5 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] hover:bg-[var(--theme-surface,#F4F4F5)] transition-all text-xs font-semibold shadow-2xs group"
        aria-label="Toggle Wishlist"
      >
        <span className={`text-base transition-transform group-hover:scale-125 ${active ? "text-rose-500" : "text-slate-400"}`}>
          {active ? "❤️" : "🤍"}
        </span>
        {showLabel && <span>{labelText}</span>}
      </button>
    </EditableComponent>
  );
}

export default WishlistBtn;
