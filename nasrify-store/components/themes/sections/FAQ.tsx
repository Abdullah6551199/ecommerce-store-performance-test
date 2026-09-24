"use client";

import React, { useState } from "react";
import { SectionProps } from "@/lib/themes/types";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSettings {
  heading?: string;
  items?: FAQItem[];
}

export default function FAQ({
  variant = "accordion",
  settings = {},
  themeSettings,
}: SectionProps<FAQSettings>) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const heading = settings.heading || "Frequently Asked Questions";
  const items = settings.items?.length
    ? settings.items
    : [
        {
          question: "How long does shipping take?",
          answer:
            "Orders typically process within 24-48 hours. Standard domestic delivery takes 3-5 business days, while express takes 1-2 business days.",
        },
        {
          question: "What is your return and exchange policy?",
          answer:
            "We offer a 30-day hassle-free return window for unworn items in original packaging with tags attached.",
        },
        {
          question: "Are your materials sustainably sourced?",
          answer:
            "Yes! Over 80% of our fabrics are certified organic or manufactured using recycled polymers and non-toxic dyes.",
        },
        {
          question: "How can I track my order status?",
          answer:
            "Once shipped, you will receive a tracking link via email or SMS. You can also view live status in your account dashboard.",
        },
      ];

  if (variant === "two_column") {
    return (
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] mb-10 text-center font-[family-name:var(--theme-font-heading)]">
          {heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="p-6 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)]">
              <h3 className="font-bold text-base sm:text-lg text-[var(--theme-text,#18181B)] mb-2">
                {item.question}
              </h3>
              <p className="text-sm text-[var(--theme-text-muted,#71717A)] leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          {heading}
        </h2>
      </div>

      <div className="divide-y divide-[var(--theme-border,#E4E4E7)] border-y border-[var(--theme-border,#E4E4E7)]">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-5">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left focus:outline-hidden"
              >
                <span className="font-semibold text-base sm:text-lg text-[var(--theme-text,#18181B)]">
                  {item.question}
                </span>
                <span className="ml-4 shrink-0 text-[var(--theme-text-muted,#71717A)]">
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {isOpen && (
                <div className="mt-3 text-sm sm:text-base text-[var(--theme-text-muted,#71717A)] leading-relaxed animate-in fade-in-50 duration-150">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
