import React from "react";
import type { Metadata } from "next";
import { listBundles } from "@/lib/bundles";
import BundleCard from "@/components/bundles/BundleCard";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Product Bundles — Save More | Apex Store",
  description: "Shop curated performance bundles. Pair top-rated footwear, technical compression wear, and endurance outerwear at special discounted package rates.",
};

export default async function BundlesListingPage(): Promise<React.JSX.Element> {
  const bundles = await listBundles({ status: "active", limit: 50 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section (Purple Gradient) */}
      <section className="relative overflow-hidden rounded-3xl border border-purple-300/40 bg-gradient-to-br from-[#3C0561] via-[#5A0891] to-[#960DF2] p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Exclusive Package Deals</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Save More with Bundles
          </h1>

          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed max-w-xl">
            Upgrade your rotation with curated apparel and footwear combinations engineered for peak endurance and discounted up to 30%.
          </p>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-[#AB3DF5]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-32 h-64 w-64 rounded-full bg-[#EACFFC]/15 blur-3xl" />
      </section>

      {/* Bundles Grid (3-4 Columns) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-purple-200/70 dark:border-purple-800/50 pb-4">
          <h2 className="text-xl font-bold text-[#3C0561] dark:text-white">
            Available Bundles ({bundles.length})
          </h2>
          <span className="text-xs text-purple-600 dark:text-purple-300 font-medium">
            All prices include instant bundle discount
          </span>
        </div>

        {bundles.length === 0 ? (
          <div className="rounded-2xl border border-purple-200 dark:border-purple-800/60 p-12 text-center text-purple-400 bg-purple-50/20">
            No active bundles available right now. Check back soon for new package releases!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
