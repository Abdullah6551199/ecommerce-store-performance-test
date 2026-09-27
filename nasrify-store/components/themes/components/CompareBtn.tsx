"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";

export interface CompareBtnProps {
  id?: string;
  sectionId?: string;
  settings?: {
    text?: string;
  };
}

export function CompareBtn({
  id = "compare_button",
  sectionId,
  settings = {},
}: CompareBtnProps) {
  const text = settings.text || "Compare";
  const [comparing, setComparing] = useState(false);

  return (
    <EditableComponent
      id={id}
      type="compare_button"
      sectionId={sectionId}
      className="inline-block my-1"
    >
      <button
        type="button"
        onClick={() => setComparing(!comparing)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] hover:bg-[var(--theme-surface,#F4F4F5)] text-xs font-medium text-[var(--theme-text,#18181B)] shadow-2xs transition-colors"
      >
        <span>⚖️</span>
        <span>{comparing ? "Compared" : text}</span>
      </button>
    </EditableComponent>
  );
}

export default CompareBtn;
