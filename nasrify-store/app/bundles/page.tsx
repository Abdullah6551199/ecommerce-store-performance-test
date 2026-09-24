import React from "react";
import type { Metadata } from "next";
import { listBundles } from "@/lib/bundles";
import BundleCard from "@/components/bundles/BundleCard";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Product Bundles — Save More | Nasrify Store",
  description: "Shop curated performance bundles at special discounted package rates.",
};

export default async function BundlesListingPage(): Promise<React.JSX.Element> {
  const bundles = await listBundles({ status: "active", limit: 50 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-accent,#18181B)] p-8 sm:p-12 text-white shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20">
            <span className="h-2 w-2 rounded-full bg-[var(--theme-primary,#25D366)] animate-pulse" />
            <span>Exclusive Package Deals</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight font-[family-name:var(--theme-font-heading)]">
            Save More with Bundles
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
            Upgrade your rotation with curated combinations discounted for instant savings.
          </p>
        </div>
      </section>

      {/* Bundles Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--theme-border,#E4E4E7)] pb-4">
          <h2 className="text-xl font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            Available Bundles ({bundles.length})
          </h2>
          <span className="text-xs text-[var(--theme-text-muted,#71717A)] font-medium">
            All prices include instant bundle discount
          </span>
        </div>

        {bundles.length === 0 ? (
          <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] p-12 text-center text-[var(--theme-text-muted,#71717A)] bg-[var(--theme-surface,#F4F4F5)]">
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
