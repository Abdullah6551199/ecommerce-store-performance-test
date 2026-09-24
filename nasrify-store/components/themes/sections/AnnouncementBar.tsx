"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionProps } from "@/lib/themes/types";

export interface AnnouncementBarSettings {
  text?: string;
  link?: string;
  bg_color?: string;
  text_color?: string;
  dismissible?: boolean;
}

export default function AnnouncementBar({
  variant = "solid",
  settings = {},
  themeSettings,
}: SectionProps<AnnouncementBarSettings>) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const text = settings.text || "Free shipping on orders over $50";
  const link = settings.link;
  const bgColor = settings.bg_color || themeSettings.colors.primary || "#18181B";
  const textColor = settings.text_color || "#FFFFFF";
  const isDismissible = settings.dismissible !== false;

  let variantClass = "py-2 px-4 text-xs sm:text-sm font-medium transition-all";
  if (variant === "gradient") {
    variantClass += " bg-gradient-to-r from-[var(--theme-primary)] via-purple-700 to-[var(--theme-accent)]";
  } else if (variant === "minimal") {
    variantClass += " border-b border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)]";
  }

  const content = (
    <div className="flex items-center justify-center gap-2 text-center">
      <span>{text}</span>
      {link && (
        <span className="underline underline-offset-2 hover:opacity-80 transition-opacity">
          Learn more &rarr;
        </span>
      )}
    </div>
  );

  return (
    <aside
      role="region"
      aria-label="Announcement"
      className={`relative w-full z-40 ${variantClass}`}
      style={
        variant === "solid"
          ? { backgroundColor: bgColor, color: textColor }
          : undefined
      }
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          {link ? (
            <Link href={link} className="block w-full">
              {content}
            </Link>
          ) : (
            content
          )}
        </div>
        {isDismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss announcement"
            className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/10 transition-colors ml-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
