import React, { Suspense } from "react";
import type { Metadata } from "next";
import ComparePageClient from "@/apps/compare/storefront/ComparePage";

export const metadata: Metadata = {
  title: "Compare Products | Nasrify Store",
  description: "Compare products side-by-side with full specifications, prices, and ratings.",
};

export default function ComparePage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4 font-[family-name:var(--theme-font-body)]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--theme-primary,#25D366)] border-r-transparent" />
          <p className="text-sm font-semibold text-[var(--theme-text-muted,#71717A)]">
            Loading compare workspace...
          </p>
        </div>
      }
    >
      <ComparePageClient />
    </Suspense>
  );
}
