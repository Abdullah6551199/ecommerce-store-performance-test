"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";
import { renderRich } from "@/lib/themes/utils";

export interface AlertBoxProps {
  id?: string;
  sectionId?: string;
  variant?: "info" | "success" | "warning" | "error" | string;
  settings?: {
    title?: string;
    message?: string;
    dismissible?: boolean;
  };
}

export function AlertBox({
  id = "alert_box",
  sectionId,
  variant = "info",
  settings = {},
}: AlertBoxProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const title = settings.title || "Limited Time Offer";
  const message =
    settings.message || "Enjoy free worldwide express shipping on orders over $150.";
  const dismissible = settings.dismissible !== false;

  const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    info: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500", icon: "ℹ️" },
    success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-500", icon: "✓" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500", icon: "⚠️" },
    error: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-500", icon: "✕" },
  };

  const scheme = colors[variant] || colors.info;

  return (
    <EditableComponent
      id={id}
      type="alert_box"
      sectionId={sectionId}
      className={`p-4 rounded-xl border ${scheme.bg} ${scheme.border} flex items-start justify-between gap-3 text-xs sm:text-sm my-3`}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base select-none shrink-0">{scheme.icon}</span>
        <div>
          {title && <h5 className={`font-bold ${scheme.text}`}>{title}</h5>}
          <div
            className="text-[var(--theme-text,#18181B)] mt-0.5 leading-relaxed"
            dangerouslySetInnerHTML={renderRich(message)}
          />
        </div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </EditableComponent>
  );
}

export default AlertBox;
