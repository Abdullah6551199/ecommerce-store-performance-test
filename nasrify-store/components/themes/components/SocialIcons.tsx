import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface SocialIconsProps {
  id?: string;
  sectionId?: string;
  settings?: {
    items?: Array<{ platform: string; icon?: string; url: string }>;
  };
}

export function SocialIcons({
  id = "social_icons",
  sectionId,
  settings = {},
}: SocialIconsProps) {
  const items = settings.items?.length
    ? settings.items
    : [
        { platform: "Twitter", icon: "𝕏", url: "https://twitter.com" },
        { platform: "Instagram", icon: "📷", url: "https://instagram.com" },
        { platform: "YouTube", icon: "▶", url: "https://youtube.com" },
      ];

  return (
    <EditableComponent
      id={id}
      type="social_icons"
      sectionId={sectionId}
      className="flex items-center gap-3 my-2"
    >
      {items.map((item, idx) => (
        <a
          key={idx}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] hover:bg-[var(--theme-surface,#F4F4F5)] flex items-center justify-center text-sm font-bold text-[var(--theme-text,#18181B)] shadow-2xs hover:scale-105 transition-all"
          aria-label={item.platform}
        >
          {item.icon || item.platform[0]}
        </a>
      ))}
    </EditableComponent>
  );
}

export default SocialIcons;
