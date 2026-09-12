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
  const settings = await getStoreSettings();

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
    <>
      {firstProductImage && (
        <link
          rel="preload"
          as="image"
          href={firstProductImage}
          fetchPriority="high"
        />
      )}

      {/* Shop Hero Header Banner */}
      <section className="border-b border-zinc-200 dark:border-white/10 bg-gradient-to-b from-zinc-100/80 to-zinc-50/20 dark:from-[#0c140f] dark:to-[#080e0a] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#18C729]/10 text-[#18C729] border border-[#18C729]/20 mb-3">
              ⚡ Full Store Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Shop All Products
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
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
    </>
  );
}
