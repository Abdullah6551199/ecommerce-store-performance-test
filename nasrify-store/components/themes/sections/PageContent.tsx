"use client";

import React from "react";
import { SectionProps } from "@/lib/themes/types";

export interface PageContentSettings {
  max_width?: string;
  padding_y?: string;
}

export default function PageContent({
  settings = {},
  storeData,
}: SectionProps<PageContentSettings>) {
  const page = storeData?.page || {
    title: "About Our Craft",
    content: `
      <h2>Our Philosophy</h2>
      <p>We believe everyday essentials should blend uncompromising performance with timeless minimalist beauty. Founded with a vision to redefine modern living, we obsess over every contour, material, and seam.</p>
      
      <h2>Direct to Consumer Craftsmanship</h2>
      <p>By eliminating middlemen and excessive markups, we deliver luxury-tier ergonomics and decor directly to your doorstep. Every piece undergoes rigorous stress testing to ensure decade-long endurance.</p>

      <h2>Sustainability & Responsibility</h2>
      <p>All packaging is 100% recyclable, and our manufacturing partners adhere to stringent environmental and ethical standards.</p>
    `,
  };

  const maxWidth = settings.max_width || "max-w-4xl";
  const paddingY = settings.padding_y || "py-6";

  return (
    <article
      className={`w-full mx-auto ${maxWidth} ${paddingY} font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]`}
    >
      {page.content ? (
        <div
          className="prose prose-zinc max-w-none text-sm sm:text-base leading-relaxed space-y-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-2 [&>h2]:text-[var(--theme-text,#18181B)] [&>p]:text-[var(--theme-text-muted,#71717A)]"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <p className="text-sm text-[var(--theme-text-muted,#71717A)]">
          No content has been published on this page yet.
        </p>
      )}
    </article>
  );
}
