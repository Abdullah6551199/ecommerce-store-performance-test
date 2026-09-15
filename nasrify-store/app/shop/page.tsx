import React from "react";
import type { Metadata } from "next";
import { searchProductsAdvanced, type AdvancedSearchParams } from "@/lib/products";
import SearchClient from "@/components/search/SearchClient";
import { getAbsoluteUrl } from "@/lib/seo";
import { normalizeImageUrl } from "@/lib/utils";
import { getStoreSettings } from "@/lib/settings";

export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    category?: string;
    brand?: string;
    tags?: string;
    inStock?: string;
    sort?: string;
    limit?: string;
    offset?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const settings = await getStoreSettings();
  const storeName = settings?.storeName || "ApexStore";

  const category = sp.category?.trim();
  const brand = sp.brand?.trim();

  let title = `Shop All Products | ${storeName}`;
  let description = `Explore the full catalog of high-performance gear, athletic footwear, and apparel at ${storeName}.`;

  if (category) {
    title = `Shop ${category} | ${storeName}`;
    description = `Explore high-performance ${category} products engineered for peak athletes.`;
  } else if (brand) {
    title = `Shop ${brand} Gear | ${storeName}`;
    description = `Discover authentic gear crafted by ${brand} at ${storeName}.`;
  }

  const queryParams = new URLSearchParams();
  if (sp.q) queryParams.set("q", sp.q);
  if (sp.category) queryParams.set("category", sp.category);
  if (sp.brand) queryParams.set("brand", sp.brand);
  if (sp.minPrice) queryParams.set("minPrice", sp.minPrice);
  if (sp.maxPrice) queryParams.set("maxPrice", sp.maxPrice);
  if (sp.tags) queryParams.set("tags", sp.tags);
  if (sp.inStock) queryParams.set("inStock", sp.inStock);
  if (sp.sort && sp.sort !== "newest") queryParams.set("sort", sp.sort);

  const qs = queryParams.toString();
  const canonical = getAbsoluteUrl(qs ? `/shop?${qs}` : "/shop");

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps): Promise<React.JSX.Element> {
  const sp = await searchParams;

  const minPrice = sp.minPrice && !isNaN(Number(sp.minPrice)) ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice && !isNaN(Number(sp.maxPrice)) ? Number(sp.maxPrice) : undefined;
  const tags = sp.tags
    ? sp.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;
  const inStock = sp.inStock === "true" || sp.inStock === "1";
  const sort =
    sp.sort === "price_asc" || sp.sort === "price_desc" || sp.sort === "newest" || sp.sort === "popular"
      ? sp.sort
      : "newest";

  const advancedParams: AdvancedSearchParams = {
    query: sp.q || "",
    minPrice,
    maxPrice,
    category: sp.category || undefined,
    brand: sp.brand || undefined,
    tags,
    inStock,
    sort,
    limit: 12,
    offset: 0,
    publishedOnly: true,
  };

  const results = await searchProductsAdvanced(advancedParams);
  const firstProductImage = results.products[0]?.mainImage
    ? normalizeImageUrl(results.products[0].mainImage, { width: 640, quality: 75 })
    : null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#3C0561]">
      {firstProductImage && (
        <link
          rel="preload"
          as="image"
          href={firstProductImage}
          fetchPriority="high"
        />
      )}

      {/* Shop Hero Header Banner */}
      <section className="relative overflow-hidden border-b border-purple-100 dark:border-purple-800/80 bg-gradient-to-r from-purple-700 via-purple-800 to-[#3C0561] py-10 sm:py-14 text-white">
        {/* Subtle ambient light glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40 backdrop-blur-sm">
              ⚡ Full Store Catalog
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Shop All Products
            </h1>
            <p className="text-sm sm:text-base text-purple-100/80 leading-relaxed max-w-xl">
              Browse our complete collection of engineered athletic footwear, technical training apparel, and performance gear.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Grid */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SearchClient
          initialProducts={results.products}
          initialTotal={results.total}
          initialFacets={results.facets}
          initialParams={advancedParams}
        />
      </main>
    </div>
  );
}
