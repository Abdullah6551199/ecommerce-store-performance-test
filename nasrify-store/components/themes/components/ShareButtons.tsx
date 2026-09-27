"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";

export interface ShareButtonsProps {
  id?: string;
  sectionId?: string;
  settings?: {
    show_whatsapp?: boolean;
    show_twitter?: boolean;
    show_copy_link?: boolean;
  };
}

export function ShareButtons({
  id = "share_buttons",
  sectionId,
  settings = {},
}: ShareButtonsProps) {
  const showWhatsapp = settings.show_whatsapp !== false;
  const showTwitter = settings.show_twitter !== false;
  const showCopyLink = settings.show_copy_link !== false;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <EditableComponent
      id={id}
      type="share_buttons"
      sectionId={sectionId}
      className="flex items-center gap-2 my-2"
    >
      <span className="text-xs font-semibold text-[var(--theme-text-muted,#71717A)] mr-1">Share:</span>
      {showWhatsapp && (
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`, "_blank");
            }
          }}
          className="p-2 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors text-xs"
          title="Share on WhatsApp"
        >
          💬
        </button>
      )}
      {showTwitter && (
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, "_blank");
            }
          }}
          className="p-2 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-slate-900 text-white hover:opacity-80 transition-opacity text-xs"
          title="Share on X"
        >
          𝕏
        </button>
      )}
      {showCopyLink && (
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] hover:bg-[var(--theme-surface,#F4F4F5)] text-xs font-medium text-[var(--theme-text,#18181B)] shadow-2xs transition-colors"
        >
          {copied ? "✓ Copied" : "🔗 Copy Link"}
        </button>
      )}
    </EditableComponent>
  );
}

export default ShareButtons;
