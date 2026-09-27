"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";
import { renderRich } from "@/lib/themes/utils";

export interface TabsProps {
  id?: string;
  sectionId?: string;
  settings?: {
    items?: Array<{ title: string; content: string }>;
  };
}

export function Tabs({
  id = "tabs",
  sectionId,
  settings = {},
}: TabsProps) {
  const items = settings.items?.length
    ? settings.items
    : [
        { title: "Overview", content: "Comprehensive overview of features and specifications." },
        { title: "Materials", content: "Crafted from sustainable recycled aerospace alloys." },
        { title: "Warranty", content: "Backed by our comprehensive 2-year no-hassle guarantee." },
      ];

  const [activeTab, setActiveTab] = useState(0);

  return (
    <EditableComponent
      id={id}
      type="tabs"
      sectionId={sectionId}
      className="border border-[var(--theme-border,#E4E4E7)] rounded-2xl overflow-hidden bg-[var(--theme-background,#FFFFFF)] shadow-xs my-4"
    >
      <div className="flex border-b border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] overflow-x-auto scrollbar-none">
        {items.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-5 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === idx
                ? "border-[var(--theme-accent,#2563EB)] text-[var(--theme-accent,#2563EB)] bg-white"
                : "border-transparent text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)]"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="p-6">
        <div
          className="text-xs sm:text-sm text-[var(--theme-text,#18181B)] leading-relaxed"
          dangerouslySetInnerHTML={renderRich(items[activeTab]?.content || "")}
        />
      </div>
    </EditableComponent>
  );
}

export default Tabs;
