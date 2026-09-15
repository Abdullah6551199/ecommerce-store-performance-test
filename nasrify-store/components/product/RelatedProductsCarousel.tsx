"use client";

import React, { useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { ProductWithImagesAndCategory } from "@/lib/products";

interface RelatedProductsCarouselProps {
  products: ProductWithImagesAndCategory[];
  categorySlug?: string | null;
}

export default function RelatedProductsCarousel({
  products,
  categorySlug,
}: RelatedProductsCarouselProps): React.JSX.Element | null {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  return (
    <section className="space-y-6 pt-8 border-t border-purple-100 dark:border-purple-800/40 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#3C0561] dark:text-[#EACFFC]">
            You May Also Like
          </h2>
          <p className="text-xs text-purple-600 dark:text-purple-300">
            Engineered companion gear curated for high performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {categorySlug && (
            <Link
              href={`/category/${categorySlug}`}
              className="text-xs font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 hover:underline hidden sm:inline"
            >
              View Category &rarr;
            </Link>
          )}

          {products.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={scrollLeft}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#3C0561] text-purple-700 dark:text-purple-200 hover:border-purple-400 hover:text-purple-900 dark:hover:text-white shadow-sm transition cursor-pointer"
                aria-label="Scroll left"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#3C0561] text-purple-700 dark:text-purple-200 hover:border-purple-400 hover:text-purple-900 dark:hover:text-white shadow-sm transition cursor-pointer"
                aria-label="Scroll right"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product items carousel */}
      <div
        ref={scrollContainerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 scrollbar-thin"
      >
        {products.map((prod) => (
          <div key={prod.id} className="min-w-[240px]">
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </section>
  );
}
