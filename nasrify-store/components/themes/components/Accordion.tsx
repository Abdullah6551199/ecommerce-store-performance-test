"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";
import { renderRich } from "@/lib/themes/utils";

export interface AccordionProps {
  id?: string;
  sectionId?: string;
  settings?: {
    items?: Array<{ title: string; content: string }>;
  };
}

export function Accordion({
  id = "accordion",
  sectionId,
  settings = {},
}: AccordionProps) {
  const items = settings.items?.length
    ? settings.items
    : [
        {
          title: "How does contactless delivery work?",
          content: "Your courier leaves your package safely at your door with photo confirmation.",
        },
        {
          title: "What is your exchange policy?",
          content: "Complimentary exchanges within 30 days of receiving your package.",
        },
      ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <EditableComponent
      id={id}
      type="accordion"
      sectionId={sectionId}
      className="divide-y divide-[var(--theme-border,#E4E4E7)] border-y border-[var(--theme-border,#E4E4E7)] my-4"
    >
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="py-3.5">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between text-left focus:outline-hidden group"
            >
              <span className="font-semibold text-xs sm:text-sm text-[var(--theme-text,#18181B)] group-hover:text-[var(--theme-accent,#2563EB)] transition-colors">
                {item.title}
              </span>
              <span className="ml-4 shrink-0 text-slate-400">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div
                className="mt-2 text-xs sm:text-sm text-[var(--theme-text-muted,#71717A)] leading-relaxed animate-in fade-in duration-150"
                dangerouslySetInnerHTML={renderRich(item.content)}
              />
            )}
          </div>
        );
      })}
    </EditableComponent>
  );
}

export default Accordion;
