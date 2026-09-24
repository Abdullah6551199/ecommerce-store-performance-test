import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { CategoryRecord } from "@/lib/categories";
import { normalizeImageUrl } from "@/lib/utils";

interface CategoryCardsRowProps {
  categories: CategoryRecord[];
  heading?: string;
  badge?: string;
}

export default function CategoryCardsRow({
  categories,
  heading = "Featured Collections",
  badge = "Curated Categories",
}: CategoryCardsRowProps): React.JSX.Element {
  // Show up to 5 categories
  const displayedCategories = (categories || []).slice(0, 5);

  if (displayedCategories.length === 0) {
    return <></>;
  }

  return (
    <section id="category-cards" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E4E4E7]/60 dark:border-zinc-800/40 pb-3">
        <div>
          {badge && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] dark:bg-[#15803D]/60 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#25D366] dark:text-[#DCFCE7] mb-1">
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#18181B] dark:text-white">
            {heading}
          </h2>
        </div>

        <Link
          href="/shop"
          className="text-xs font-bold text-[#25D366] dark:text-[#1EA855] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>All Categories &rarr;</span>
        </Link>
      </div>

      {/* 5-Column Responsive Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {displayedCategories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#E4E4E7]/70 dark:border-zinc-800/50 bg-[#DCFCE7]/30 dark:bg-[#15803D]/40 p-3.5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white dark:hover:bg-[#15803D] hover:border-[#25D366]/60 hover:shadow-xl hover:shadow-[#25D366]/20"
          >
            {/* Category Image (4:5 / Square) */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-[#DCFCE7]/50 dark:bg-[#18181B]/40">
              {category.imageUrl ? (
                <Image
                  src={normalizeImageUrl(category.imageUrl, { width: 400, quality: 75 })}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#DCFCE7]/60 to-[#DCFCE7]/40 dark:from-[#18181B] dark:to-[#15803D] p-4 text-center">
                  <span className="text-2xl font-black text-[#25D366] dark:text-[#DCFCE7] uppercase">
                    {category.name.substring(0, 2)}
                  </span>
                </div>
              )}
              {/* Subtle bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
            </div>

            {/* Category Details */}
            <div className="mt-3 text-center space-y-1">
              <h3 className="text-sm font-extrabold text-[#18181B] dark:text-white group-hover:text-[#25D366] dark:group-hover:text-[#1EA855] transition-colors truncate">
                {category.name}
              </h3>
              <p className="text-xs font-bold text-[#25D366] dark:text-[#1EA855] group-hover:translate-x-0.5 inline-flex items-center gap-1 transition-transform">
                <span>Shop Now</span>
                <span aria-hidden="true">&rarr;</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
