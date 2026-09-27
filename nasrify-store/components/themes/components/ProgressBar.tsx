import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface ProgressBarProps {
  id?: string;
  sectionId?: string;
  variant?: "standard" | "striped" | "gradient" | string;
  settings?: {
    label?: string;
    percentage?: number;
    show_number?: boolean;
  };
}

export function ProgressBar({
  id = "progress_bar",
  sectionId,
  variant = "standard",
  settings = {},
}: ProgressBarProps) {
  const label = settings.label || "Shipping Tier Qualified";
  const percentage = Math.min(100, Math.max(0, settings.percentage ?? 75));
  const showNumber = settings.show_number !== false;

  return (
    <EditableComponent
      id={id}
      type="progress_bar"
      sectionId={sectionId}
      className="space-y-1.5 my-3"
    >
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--theme-text,#18181B)]">
        <span>{label}</span>
        {showNumber && <span>{percentage}%</span>}
      </div>
      <div className="h-2.5 w-full bg-[var(--theme-surface,#F4F4F5)] rounded-full overflow-hidden border border-[var(--theme-border,#E4E4E7)]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            variant === "gradient"
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : variant === "striped"
              ? "bg-[var(--theme-accent,#2563EB)] bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]"
              : "bg-[var(--theme-accent,#2563EB)]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </EditableComponent>
  );
}

export default ProgressBar;
