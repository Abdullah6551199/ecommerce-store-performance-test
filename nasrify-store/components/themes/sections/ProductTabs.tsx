"use client";

import React, { useState } from "react";
import { SectionProps } from "@/lib/themes/types";

export interface TabItem {
  id: string;
  label: string;
  content?: string;
}

export interface ProductTabsSettings {
  tabs?: TabItem[];
  default_tab?: string;
}

export default function ProductTabs({
  variant = "standard",
  settings = {},
  storeData,
}: SectionProps<ProductTabsSettings>) {
  const product = storeData?.product;

  const defaultTabs: TabItem[] = [
    {
      id: "description",
      label: "Description",
      content:
        product?.description ||
        "Constructed using high-density aircraft-grade materials with an ergonomic curved profile. Designed to withstand daily commercial use while delivering exceptional tactile comfort and refined modern aesthetics.",
    },
    {
      id: "specifications",
      label: "Specifications",
      content:
        "• Material: Anodized aluminum frame & reinforced mesh\n• Dimensions: 42cm × 58cm × 95cm\n• Weight: 8.5 kg\n• Maximum Capacity: 150 kg\n• Warranty: 5 Years Limited Manufacturer Guarantee",
    },
    {
      id: "shipping",
      label: "Shipping & Returns",
      content:
        "Standard express shipping dispatched within 24 hours. Free 30-day money-back satisfaction guarantee on all original condition orders with prepaid return labels.",
    },
  ];

  const tabs = (settings.tabs && settings.tabs.length > 0) ? settings.tabs : defaultTabs;
  const [activeTab, setActiveTab] = useState<string>(settings.default_tab || tabs[0]?.id || "description");
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    [tabs[0]?.id || "description"]: true,
  });

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isAccordion = variant === "accordion";

  return (
    <div className="w-full my-8 font-[family-name:var(--theme-font-body)]">
      {isAccordion ? (
        <div className="divide-y divide-[var(--theme-border,#E4E4E7)] border-y border-[var(--theme-border,#E4E4E7)]">
          {tabs.map((tab) => {
            const isOpen = !!openAccordions[tab.id];
            return (
              <div key={tab.id} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion(tab.id)}
                  className="flex w-full items-center justify-between text-left font-semibold text-sm sm:text-base text-[var(--theme-text,#18181B)]"
                >
                  <span>{tab.label}</span>
                  <span className="text-xl transition-transform duration-200">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-3 text-sm text-[var(--theme-text-muted,#71717A)] whitespace-pre-line leading-relaxed">
                    {tab.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] overflow-hidden bg-[var(--theme-background,#FFFFFF)]">
          {/* Tab Headers */}
          <div className="flex border-b border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    borderBottomColor: active ? "var(--theme-primary, #25D366)" : "transparent",
                    color: active ? "var(--theme-text, #18181B)" : "var(--theme-text-muted, #71717A)",
                  }}
                  className={`px-5 py-3.5 text-sm font-semibold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                    active ? "bg-[var(--theme-background,#FFFFFF)]" : "hover:text-[var(--theme-text,#18181B)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          <div className="p-6 text-sm text-[var(--theme-text-muted,#71717A)] leading-relaxed whitespace-pre-line">
            {tabs.find((t) => t.id === activeTab)?.content || tabs[0]?.content}
          </div>
        </div>
      )}
    </div>
  );
}
