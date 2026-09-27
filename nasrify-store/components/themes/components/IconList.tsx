import React from "react";
import Link from "next/link";
import { EditableComponent } from "../EditableComponent";

export interface IconListProps {
  id?: string;
  sectionId?: string;
  settings?: {
    items?: Array<{ icon?: string; text: string; link?: string }>;
  };
}

export function IconList({
  id = "icon_list",
  sectionId,
  settings = {},
}: IconListProps) {
  const items = settings.items?.length
    ? settings.items
    : [
        { icon: "✓", text: "100% Certified Organic Materials" },
        { icon: "✓", text: "Zero Carbon Footprint Shipping" },
        { icon: "✓", text: "30-Day Money Back Guarantee" },
      ];

  return (
    <EditableComponent
      id={id}
      type="icon_list"
      sectionId={sectionId}
      className="space-y-2.5 my-3"
    >
      <ul className="space-y-2 text-xs sm:text-sm">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
              {item.icon || "✓"}
            </span>
            {item.link ? (
              <Link
                href={item.link}
                className="text-[var(--theme-text,#18181B)] hover:text-[var(--theme-accent,#2563EB)] transition-colors"
              >
                {item.text}
              </Link>
            ) : (
              <span className="text-[var(--theme-text,#18181B)]">{item.text}</span>
            )}
          </li>
        ))}
      </ul>
    </EditableComponent>
  );
}

export default IconList;
