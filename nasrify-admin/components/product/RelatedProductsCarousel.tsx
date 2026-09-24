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
    <section className="space-y-6 pt-8 border-t border-[#E4E4E7] dark:border-zinc-800/40 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#18181B] dark:text-[#DCFCE7]">
            You May Also Like
          </h2>
          <p className="text-xs text-[#25D366] dark:text-zinc-400">
            Engineered companion gear curated for high performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {categorySlug && (
            <Link
              href={`/category/${categorySlug}`}
              className="text-xs font-semibold text-[#25D366] dark:text-zinc-400 hover:text-[#15803D] dark:hover:text-zinc-200 hover:underline hidden sm:inline"
            >
              View Category &rarr;
            </Link>
          )}

          {products.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={scrollLeft}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-white dark:bg-[#18181B] text-[#1EA855] dark:text-zinc-300 hover:border-[#25D366] hover:text-[#18181B] dark:hover:text-white shadow-sm transition cursor-pointer"
                aria-label="Scroll left"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-white dark:bg-[#18181B] text-[#1EA855] dark:text-zinc-300 hover:border-[#25D366] hover:text-[#18181B] dark:hover:text-white shadow-sm transition cursor-pointer"
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
