"use client";

import React, { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import type { ProductWithImagesAndCategory } from "@/lib/products";

interface RecentlyViewedCarouselProps {
  currentProductId: string;
}

export default function RecentlyViewedCarousel({
  currentProductId,
}: RecentlyViewedCarouselProps): React.JSX.Element | null {
  const [products, setProducts] = useState<ProductWithImagesAndCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // 1. Read existing recently viewed IDs
      const raw = localStorage.getItem("recently_viewed_v1");
      let storedIds: string[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            storedIds = parsed.filter((id) => typeof id === "string");
          }
        } catch {
          storedIds = [];
        }
      }

      // 2. Identify the target IDs to display (last viewed other than current)
      const targetIds = storedIds.filter((id) => id !== currentProductId).slice(0, 4);

      // 3. Update localStorage with current product prepended and trimmed to 20
      const updatedIds = [currentProductId, ...storedIds.filter((id) => id !== currentProductId)].slice(0, 20);
      localStorage.setItem("recently_viewed_v1", JSON.stringify(updatedIds));

      // 4. Fetch the target products if any exist
      if (targetIds.length > 0) {
        fetch(`/api/products/batch?ids=${encodeURIComponent(targetIds.join(","))}`)
          .then((res) => (res.ok ? (res.json() as Promise<{ products?: ProductWithImagesAndCategory[] }>) : Promise.reject(res)))
          .then((data: { products?: ProductWithImagesAndCategory[] }) => {
            if (data && Array.isArray(data.products)) {
              setProducts(data.products);
            }
          })
          .catch((err) => console.warn("[RecentlyViewed] Failed to fetch items:", err))
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      console.warn("[RecentlyViewed] LocalStorage error:", e);
      setIsLoading(false);
    }
  }, [currentProductId]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 pt-8 border-t border-purple-100 dark:border-purple-800/40 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#3C0561] dark:text-[#EACFFC]">
            Recently Viewed
          </h2>
          <p className="text-xs text-purple-600 dark:text-purple-300">
            Items you browsed during your recent sessions.
          </p>
        </div>

        {/* Carousel Desktop Navigation Arrows */}
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

      {/* Products Row / Carousel Container */}
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
