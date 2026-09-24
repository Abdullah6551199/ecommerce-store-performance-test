"use client";

import React from "react";
import Link from "next/link";
import { SectionProps } from "@/lib/themes/types";

export interface PageHeaderSettings {
  show_breadcrumb?: boolean;
  alignment?: "left" | "center";
}

export default function PageHeader({
  variant = "simple",
  settings = {},
  storeData,
}: SectionProps<PageHeaderSettings>) {
  const page = storeData?.page || {
    title: "About Our Craft",
    slug: "about",
  };

  const showBreadcrumb = settings.show_breadcrumb !== false;
  const alignment = settings.alignment || "center";
  const isCentered = alignment === "center";

  if (variant === "banner") {
    return (
      <div
        style={{
          borderRadius: "var(--theme-radius, 8px)",
          backgroundColor: "var(--theme-primary-light, #DCFCE7)",
        }}
        className="w-full py-12 px-6 mb-8 text-center font-[family-name:var(--theme-font-body)]"
      >
        {showBreadcrumb && (
          <nav className="flex items-center justify-center gap-2 text-xs text-[var(--theme-text-muted,#71717A)] mb-2">
            <Link href="/" className="hover:text-[var(--theme-primary,#25D366)]">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[var(--theme-text,#18181B)]">{page.title}</span>
          </nav>
        )}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          {page.title}
        </h1>
      </div>
    );
  }

  return (
    <div
      className={`w-full pt-4 pb-6 mb-8 border-b border-[var(--theme-border,#E4E4E7)] font-[family-name:var(--theme-font-body)] ${
        isCentered ? "text-center items-center flex flex-col" : ""
      }`}
    >
      {showBreadcrumb && (
        <nav className="flex items-center gap-2 text-xs text-[var(--theme-text-muted,#71717A)] mb-2.5">
          <Link href="/" className="hover:text-[var(--theme-primary,#25D366)]">Home</Link>
          <span>/</span>
          <span className="font-medium text-[var(--theme-text,#18181B)]">{page.title}</span>
        </nav>
      )}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
        {page.title}
      </h1>
    </div>
  );
}
