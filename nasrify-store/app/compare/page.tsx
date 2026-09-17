import React, { Suspense } from "react";
import type { Metadata } from "next";
import CompareTable from "@/components/compare/CompareTable";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Compare Products | Apex Store",
  description: "Compare up to 4 athletic shoes and apparel items side-by-side with full specifications, prices, and ratings.",
};

export default function ComparePage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#960DF2] border-r-transparent" />
          <p className="text-sm font-semibold text-purple-600 dark:text-purple-300">
            Loading compare workspace...
          </p>
        </div>
      }
    >
      <ErrorBoundary name="Compare">
        <CompareTable />
      </ErrorBoundary>
    </Suspense>
  );
}
