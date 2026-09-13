"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ProductWithImagesAndCategory } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

interface TrendingProductsSectionProps {
  bestSellers: ProductWithImagesAndCategory[];
  newArrivals: ProductWithImagesAndCategory[];
  topRated: ProductWithImagesAndCategory[];
  badge?: string;
  heading?: string;
}

type TabType = "best_sellers" | "new_arrivals" | "top_rated";

export default function TrendingProductsSection({
  bestSellers,
  newArrivals,
  topRated,
  badge = "Customer Favorites",
  heading = "Trending Products",
}: TrendingProductsSectionProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("best_sellers");

  const getActiveList = () => {
    switch (activeTab) {
      case "new_arrivals":
        return newArrivals && newArrivals.length > 0 ? newArrivals : bestSellers;
      case "top_rated":
        return topRated && topRated.length > 0 ? topRated : bestSellers;
      case "best_sellers":
      default:
        return bestSellers;
    }
  };

  const displayedProducts = getActiveList().slice(0, 10);

  return (
    <section id="trending-products" className="space-y-8">
      {/* Section Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-purple-200/60 dark:border-purple-800/40 pb-4">
        <div>
          {badge && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EACFFC] dark:bg-[#5A0891]/60 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#960DF2] dark:text-[#EACFFC] mb-1">
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#3C0561] dark:text-white">
            {heading}
          </h2>
        </div>

        {/* Dynamic Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-[#3C0561]/60 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("best_sellers")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "best_sellers"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-zinc-600 dark:text-purple-200 hover:text-[#960DF2]"
            }`}
          >
            Best Seller
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("new_arrivals")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "new_arrivals"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-zinc-600 dark:text-purple-200 hover:text-[#960DF2]"
            }`}
          >
            New Arrivals
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("top_rated")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "top_rated"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-zinc-600 dark:text-purple-200 hover:text-[#960DF2]"
            }`}
          >
            Top Rated
          </button>
        </div>
      </div>

      {/* Product Grid (5 Columns on Desktop) */}
      {displayedProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-purple-300 dark:border-purple-800/60 bg-purple-50/30 dark:bg-[#3C0561]/40 p-12 text-center">
          <p className="text-sm font-semibold text-zinc-700 dark:text-purple-200">No products found for this filter.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-lg bg-[#960DF2] px-4 py-2 text-xs font-bold text-white hover:bg-[#780AC2]"
          >
            Browse Store Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
          {displayedProducts.map((prod) => (
            <ProductCard key={`${activeTab}-${prod.id}`} product={prod} />
          ))}
        </div>
      )}

      {/* Bottom Navigation Dots & Link */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-6 rounded-full bg-[#960DF2]" />
          <span className="h-2 w-2 rounded-full bg-purple-200 dark:bg-purple-800" />
          <span className="h-2 w-2 rounded-full bg-purple-200 dark:bg-purple-800" />
        </div>

        <Link
          href="/shop"
          className="text-xs font-bold text-[#960DF2] dark:text-[#C06EF7] hover:underline"
        >
          View All Trending &rarr;
        </Link>
      </div>
    </section>
  );
}
