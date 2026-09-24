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
      <p>By eliminating middlemen and excessive markups, we deliver luxury-tier ergonomics directly to your doorstep. Every piece undergoes rigorous stress testing to ensure decade-long endurance.</p>

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
      <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-8 sm:p-12 shadow-sm">
        {page.content ? (
          <div
            className="prose max-w-none text-sm sm:text-base leading-relaxed space-y-4
              [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-black [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:text-[var(--theme-text,#18181B)] [&>h2]:font-[family-name:var(--theme-font-heading)]
              [&>h3]:text-lg [&>h3]:font-extrabold [&>h3]:mt-6 [&>h3]:mb-2 [&>h3]:text-[var(--theme-text,#18181B)] [&>h3]:font-[family-name:var(--theme-font-heading)]
              [&>p]:text-[var(--theme-text,#18181B)] [&>p]:leading-relaxed
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul]:text-[var(--theme-text,#18181B)]
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>ol]:text-[var(--theme-text,#18181B)]
              [&>li]:text-[var(--theme-text,#18181B)]
              [&>strong]:font-bold [&>strong]:text-[var(--theme-text,#18181B)]
              [&>a]:text-[var(--theme-primary,#25D366)] [&>a]:underline hover:[&>a]:brightness-90"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="text-sm text-[var(--theme-text-muted,#71717A)]">
            No content has been published on this page yet.
          </p>
        )}
      </div>
    </article>
  );
}
