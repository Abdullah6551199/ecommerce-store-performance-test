"use client";

import React, { useState } from "react";
import { SectionProps } from "@/lib/themes/types";

export interface NewsletterSettings {
  heading?: string;
  subheading?: string;
  placeholder?: string;
  button_text?: string;
  bg_color?: string;
}

export default function Newsletter({
  variant = "inline",
  settings = {},
  themeSettings,
}: SectionProps<NewsletterSettings>) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const heading = settings.heading || "Subscribe for updates";
  const subheading =
    settings.subheading ||
    "Get exclusive early access to drops, member discounts, and design insights.";
  const placeholder = settings.placeholder || "Enter your email address...";
  const buttonText = settings.button_text || "Subscribe";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  const containerClass =
    variant === "boxed"
      ? "max-w-5xl mx-auto my-12 rounded-[var(--theme-radius,8px)] p-8 sm:p-12 border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] shadow-xs"
      : variant === "full_width"
      ? "w-full py-16 sm:py-20 bg-[var(--theme-surface,#F4F4F5)]"
      : "max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8";

  return (
    <section className={containerClass}>
      <div className="max-w-2xl mx-auto text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          {heading}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--theme-text-muted,#71717A)] font-[family-name:var(--theme-font-body)]">
          {subheading}
        </p>

        {submitted ? (
          <div className="mt-6 p-4 rounded-[var(--theme-radius,8px)] bg-emerald-50 text-emerald-800 text-sm font-semibold border border-emerald-200">
            ✓ Thank you for subscribing! Check your inbox soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full sm:max-w-md px-4 py-3 text-sm rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] text-[var(--theme-text,#18181B)] focus:outline-hidden focus:ring-2 focus:ring-[var(--theme-accent,#2563EB)]"
            />
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-white hover:bg-[var(--theme-accent,#2563EB)] transition-colors shadow-xs shrink-0"
            >
              {buttonText}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
