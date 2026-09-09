import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { searchProducts, listProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  if (q) {
    return {
      title: `Search: "${q}" | Apex Store`,
      description: `Search results for "${q}" in our product catalog.`,
    };
  }
  return {
    title: "Catalog Search | Apex Store",
    description: "Browse and search all products across our catalog.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps): Promise<React.JSX.Element> {
  const { q } = await searchParams;
  const searchQuery = (q || "").trim();

  const products = searchQuery
    ? await searchProducts(searchQuery, { publishedOnly: true, limit: 40 })
    : await listProducts({ status: "published", limit: 40 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Search Header Banner */}
      <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0e1611]/80 to-[#080e0a]/90 p-8 sm:p-10 backdrop-blur-xl shadow-2xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#18C729]/30 bg-[#18C729]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#18C729]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
            <span>Storefront Catalog Search</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {searchQuery ? (
              <>
                Search Results for <span className="text-[#18C729]">&quot;{searchQuery}&quot;</span>
              </>
            ) : (
              "Explore All Products"
            )}
          </h1>

          <p className="text-xs sm:text-sm text-white/60">
            {searchQuery
              ? `Found ${products.length} ${products.length === 1 ? "product" : "products"} matching your keyword query.`
              : "Browsing all available published items across our catalog taxonomy."}
          </p>

          {/* Search Form */}
          <form action="/search" method="GET" className="flex items-center gap-2 pt-2 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by product name, SKU, brand, or tag..."
                className="w-full rounded-2xl border border-white/15 bg-white/5 pl-10 pr-4 py-3 text-xs text-white placeholder-white/40 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
              />
              <svg
                className="absolute left-3.5 top-3.5 h-4 w-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-6 py-3 text-xs font-bold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs text-white/50">
          <span>{products.length} Results</span>
          {searchQuery && (
            <Link href="/search" className="text-[#FEF500] hover:underline">
              Clear Search Filter
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-[#0c140f]/60 p-16 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[#FEF500]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-white">No Matching Products Found</h3>
            <p className="mt-1 text-xs text-white/50 max-w-sm mx-auto">
              We couldn&apos;t find any products matching &quot;{searchQuery}&quot;. Try searching with a different term, SKU, or brand.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/search"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
              >
                Browse All Products
              </Link>
              <Link
                href="/"
                className="rounded-xl bg-[#18C729] px-4 py-2 text-xs font-semibold text-black hover:brightness-110"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
