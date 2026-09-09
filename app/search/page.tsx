import React from "react";
import type { Metadata } from "next";
import { searchProductsAdvanced, type AdvancedSearchParams } from "@/lib/products";
import SearchClient from "@/components/search/SearchClient";
import { getAbsoluteUrl } from "@/lib/seo";

export const revalidate = 60;

interface SearchPageProps {
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

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const category = sp.category?.trim();
  const brand = sp.brand?.trim();

  let title = "Storefront Search & Catalog | Apex Store";
  let description = "Browse and search all products across our catalog with advanced filters.";

  if (q) {
    title = `Search: "${q}" | Apex Store`;
    description = `Search results for "${q}" across our product catalog.`;
  } else if (category) {
    title = `Category: ${category} | Apex Store`;
    description = `Discover premium products in the ${category} category.`;
  } else if (brand) {
    title = `Brand: ${brand} | Apex Store`;
    description = `Discover authentic products by ${brand}.`;
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
  const canonical = getAbsoluteUrl(qs ? `/search?${qs}` : "/search");

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

export default async function SearchPage({ searchParams }: SearchPageProps): Promise<React.JSX.Element> {
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
      : undefined;

  const advancedParams: AdvancedSearchParams = {
    query: sp.q || "",
    minPrice,
    maxPrice,
    category: sp.category || undefined,
    brand: sp.brand || undefined,
    tags,
    inStock,
    sort,
    limit: 40,
    offset: 0,
    publishedOnly: true,
  };

  const results = await searchProductsAdvanced(advancedParams);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SearchClient
        initialProducts={results.products}
        initialTotal={results.total}
        initialFacets={results.facets}
        initialParams={advancedParams}
      />
    </div>
  );
}
