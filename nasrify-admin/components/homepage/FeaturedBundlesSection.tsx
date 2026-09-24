import React from "react";
import Link from "next/link";
import BundleCard from "@/components/bundles/BundleCard";
import type { BundleWithItems } from "@/lib/bundles";

interface FeaturedBundlesSectionProps {
  bundles: BundleWithItems[];
}

export default function FeaturedBundlesSection({
  bundles,
}: FeaturedBundlesSectionProps): React.JSX.Element | null {
  if (!bundles || bundles.length === 0) return null;

  return (
    <section
      id="featured-bundles"
      aria-label="Featured Product Bundles"
      className="space-y-6 pt-4"
    >
      <div className="flex items-center justify-between border-b border-[#E4E4E7]/70 dark:border-zinc-800/50 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#25D366] dark:text-[#1EA855]">
            <span>★ Exclusive Packages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-white mt-1">
            Featured Bundles
          </h2>
        </div>

        <Link
          href="/bundles"
          className="text-xs font-bold text-[#25D366] dark:text-[#1EA855] hover:underline flex items-center gap-1"
        >
          <span>View All Bundles</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bundles.slice(0, 4).map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </section>
  );
}
