import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";

export interface CategoriesSettings {
  heading?: string;
  category_ids?: string[];
  columns?: number;
  image_style?: "rounded" | "circle" | "square";
}

export default function Categories({
  variant = "grid",
  settings = {},
  themeSettings,
  storeData,
}: SectionProps<CategoriesSettings>) {
  const heading = settings.heading || "Shop by Category";
  const columns = settings.columns || 4;
  const imageStyle = settings.image_style || (variant === "circle" ? "circle" : "rounded");

  const categoriesList = storeData?.categories || [];

  const colClasses: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
  };

  const gridClass = colClasses[columns] || colClasses[4];

  if (variant === "list") {
    return (
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] mb-6 font-[family-name:var(--theme-font-heading)]">
          {heading}
        </h2>
        <div className="divide-y divide-[var(--theme-border,#E4E4E7)] border-y border-[var(--theme-border,#E4E4E7)]">
          {categoriesList.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="py-4 flex items-center justify-between group hover:px-2 transition-all"
            >
              <span className="font-semibold text-base sm:text-lg text-[var(--theme-text,#18181B)] group-hover:text-[var(--theme-accent,#2563EB)] transition-colors">
                {cat.name}
              </span>
              <span className="text-sm text-[var(--theme-text-muted,#71717A)] group-hover:translate-x-1 transition-transform">
                Explore &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          {heading}
        </h2>
        <Link
          href="/shop"
          className="text-sm font-semibold text-[var(--theme-accent,#2563EB)] hover:underline inline-flex items-center gap-1"
        >
          All categories &rarr;
        </Link>
      </div>

      <div className={`grid gap-4 sm:gap-6 ${gridClass}`}>
        {categoriesList.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex flex-col items-center text-center p-4 rounded-[var(--theme-radius,8px)] transition-all hover:bg-[var(--theme-surface,#F4F4F5)]"
          >
            <div
              className={`relative aspect-square w-full max-w-[220px] overflow-hidden bg-gray-100 mb-4 shadow-xs ${
                imageStyle === "circle" ? "rounded-full" : "rounded-[var(--theme-radius,8px)]"
              }`}
            >
              <Image
                src={
                  category.imageUrl ||
                  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=600&auto=format&fit=crop"
                }
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[var(--theme-text,#18181B)] group-hover:text-[var(--theme-accent,#2563EB)] transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="mt-1 text-xs text-[var(--theme-text-muted,#71717A)] line-clamp-1">
                {category.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
