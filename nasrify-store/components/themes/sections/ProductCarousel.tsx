"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";

export interface ProductCarouselSettings {
  heading?: string;
  product_ids?: string[];
  collection?: string;
  autoplay?: boolean;
  show_arrows?: boolean;
  show_dots?: boolean;
}

export default function ProductCarousel({
  variant = "scroll",
  settings = {},
  themeSettings,
  storeData,
}: SectionProps<ProductCarouselSettings>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const heading = settings.heading || "New Arrivals";
  const showArrows = settings.show_arrows !== false;

  const productsList = storeData?.products || [];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          {heading}
        </h2>
        {showArrows && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-2 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] hover:bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text,#18181B)] transition-colors shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-2 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] hover:bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text,#18181B)] transition-colors shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {productsList.map((product) => {
          const currentPrice = product.salePrice ?? product.price;
          return (
            <div
              key={product.id}
              className="w-[240px] sm:w-[280px] shrink-0 snap-start flex flex-col rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] overflow-hidden transition-all hover:shadow-md"
            >
              <Link
                href={`/product/${product.slug}`}
                className="relative aspect-square w-full bg-[var(--theme-surface,#F4F4F5)] overflow-hidden group"
              >
                <Image
                  src={product.imageUrl || product.mainImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="280px"
                />
              </Link>
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="font-medium text-sm text-[var(--theme-text,#18181B)] hover:text-[var(--theme-accent,#2563EB)] line-clamp-1 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs text-[var(--theme-text-muted,#71717A)]">
                    In Stock
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-bold text-[var(--theme-text,#18181B)]">
                    ${currentPrice.toFixed(2)}
                  </span>
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-xs font-semibold text-[var(--theme-accent,#2563EB)] hover:underline"
                  >
                    View &rarr;
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
