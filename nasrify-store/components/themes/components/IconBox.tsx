import React from "react";
import Link from "next/link";
import { EditableComponent } from "../EditableComponent";
import { renderRich } from "@/lib/themes/utils";

export interface IconBoxProps {
  id?: string;
  sectionId?: string;
  variant?: "stacked" | "horizontal" | "card" | string;
  settings?: {
    icon?: string;
    title?: string;
    description?: string;
    link?: string;
  };
}

export function IconBox({
  id = "icon_box",
  sectionId,
  variant = "stacked",
  settings = {},
}: IconBoxProps) {
  const icon = settings.icon || "🚀";
  const title = settings.title || "Express Global Delivery";
  const description = settings.description || "Orders dispatched in 24 hours with worldwide express couriers.";
  const link = settings.link;

  const isHorizontal = variant === "horizontal";
  const isCard = variant === "card";

  const ContentWrapper = link ? Link : "div";
  const linkProps = link ? { href: link } : {};

  return (
    <EditableComponent
      id={id}
      type="icon_box"
      sectionId={sectionId}
      className={`transition-all ${
        isCard
          ? "p-6 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] shadow-xs hover:shadow-md"
          : ""
      }`}
    >
      <ContentWrapper
        {...(linkProps as any)}
        className={`flex ${
          isHorizontal ? "flex-row items-start gap-4 text-left" : "flex-col items-center text-center gap-3"
        } group`}
      >
        <div className="w-12 h-12 rounded-xl bg-[var(--theme-accent,#2563EB)]/10 text-[var(--theme-accent,#2563EB)] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h4
            className="text-base font-bold text-[var(--theme-text,#18181B)] tracking-tight"
            dangerouslySetInnerHTML={renderRich(title)}
          />
          <p
            className="mt-1 text-xs sm:text-sm text-[var(--theme-text-muted,#71717A)] leading-relaxed"
            dangerouslySetInnerHTML={renderRich(description)}
          />
        </div>
      </ContentWrapper>
    </EditableComponent>
  );
}

export default IconBox;
