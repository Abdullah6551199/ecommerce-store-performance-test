"use client";

import React from "react";
import Link from "next/link";
import { SectionProps } from "@/lib/themes/types";

export interface CategoryHeaderSettings {
  show_breadcrumb?: boolean;
  show_description?: boolean;
  layout?: "simple" | "banner" | "centered";
}

export default function CategoryHeader({
  variant = "simple",
  settings = {},
  storeData,
}: SectionProps<CategoryHeaderSettings>) {
  const category = storeData?.category || {
    name: "Living & Workspace",
    description: "Carefully curated furnishings and desktop accessories designed for productivity and calm aesthetics.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
  };

  const showBreadcrumb = settings.show_breadcrumb !== false;
  const showDescription = settings.show_description !== false;
  const layout = settings.layout || variant || "simple";

  if (layout === "banner" && category.image) {
    return (
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${category.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "var(--theme-radius, 8px)",
        }}
        className="w-full text-white p-8 sm:p-12 mb-8 flex flex-col justify-center items-center text-center font-[family-name:var(--theme-font-body)]"
      >
        {showBreadcrumb && (
          <nav className="flex items-center gap-2 text-xs text-gray-200 mb-3">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:underline">Collections</Link>
            <span>/</span>
            <span className="font-semibold text-white">{category.name}</span>
          </nav>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-[family-name:var(--theme-font-heading)]">
          {category.name}
        </h1>
        {showDescription && category.description && (
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-200">
            {category.description}
          </p>
        )}
      </div>
    );
  }

  const isCentered = layout === "centered";

  return (
    <div
      className={`w-full mb-8 pt-4 pb-6 border-b border-[var(--theme-border,#E4E4E7)] font-[family-name:var(--theme-font-body)] ${
        isCentered ? "text-center items-center flex flex-col" : ""
      }`}
    >
      {showBreadcrumb && (
        <nav className="flex items-center gap-2 text-xs text-[var(--theme-text-muted,#71717A)] mb-2.5">
          <Link href="/" className="hover:text-[var(--theme-primary,#25D366)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--theme-primary,#25D366)] transition-colors">
            Collections
          </Link>
          <span>/</span>
          <span className="font-medium text-[var(--theme-text,#18181B)]">
            {category.name}
          </span>
        </nav>
      )}

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
        {category.name}
      </h1>

      {showDescription && category.description && (
        <p className="mt-2 text-sm text-[var(--theme-text-muted,#71717A)] max-w-3xl">
          {category.description}
        </p>
      )}
    </div>
  );
}
