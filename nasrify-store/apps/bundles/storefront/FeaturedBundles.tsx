import React from "react";
import Link from "next/link";
import BundleCard from "./BundleCard";
import { getFeaturedBundles, getBundlesSettings } from "../lib/bundles";
import type { BundleWithItems } from "../shared/types";

interface Props {
  bundles?: BundleWithItems[];
}

export default async function FeaturedBundles({ bundles: propBundles }: Props): Promise<React.JSX.Element | null> {
  const settings = await getBundlesSettings();
  if (!settings.enableHomepageSection) {
    return null;
  }

  const bundles = propBundles || (await getFeaturedBundles(settings.maxBundlesPerSection || 4));
  if (!bundles || bundles.length === 0) return null;

  return (
    <section
      id="featured-bundles"
      aria-label="Featured Product Bundles"
      className="space-y-6 pt-4 w-full"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#25D366]">
            <span>★ Exclusive Packages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-1">
            Featured Bundles
          </h2>
        </div>

        <Link
          href="/bundles"
          className="text-xs font-bold text-[#25D366] hover:underline flex items-center gap-1"
        >
          <span>View All Bundles</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bundles.slice(0, settings.maxBundlesPerSection || 4).map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} badgeText={settings.bundleBadgeText} />
        ))}
      </div>
    </section>
  );
}
