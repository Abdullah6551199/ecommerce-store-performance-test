import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";
import { renderRich } from "@/lib/themes/utils";

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

  if (variant === "masonry") {
    return (
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2
            data-editable="heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <Link
            href="/shop"
            className="text-sm font-semibold text-[var(--theme-accent,#2563EB)] hover:underline inline-flex items-center gap-1"
          >
            All collections &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
          {categoriesList.slice(0, 5).map((category, idx) => {
            const isSpan = idx === 0 || idx === 3;
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`group relative overflow-hidden rounded-[var(--theme-radius,8px)] shadow-md flex items-end p-6 ${
                  isSpan ? "md:col-span-2" : "md:col-span-1"
                }`}
              >
                <Image
                  src={
                    category.imageUrl ||
                    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop"
                  }
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10 text-white">
                  <h3 className="font-bold text-xl sm:text-2xl font-[family-name:var(--theme-font-heading)]">
                    {category.name}
                  </h3>
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                    Explore &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  // Variant: circle_icons (Round category icons)
  if (variant === "circle_icons") {
    return (
      <section id="categories" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          data-editable="heading"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-8 font-[family-name:var(--theme-font-heading)]"
          dangerouslySetInnerHTML={renderRich(heading)}
        />
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {categoriesList.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-800 bg-slate-900 group-hover:border-emerald-500 transition-colors flex items-center justify-center p-2">
                <span className="text-2xl">🏷️</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Variant: featured_one (1 Big + 4 Small Grid)
  if (variant === "featured_one") {
    const featured = categoriesList[0];
    const smalls = categoriesList.slice(1, 5);

    return (
      <section id="categories" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2
            data-editable="heading"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <Link href="/shop" className="text-sm font-semibold text-emerald-400 hover:underline">
            All categories &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {featured && (
            <Link
              href={`/category/${featured.slug}`}
              className="lg:col-span-6 relative aspect-square rounded-2xl overflow-hidden p-8 flex items-end bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent border border-slate-800 group"
            >
              <div className="z-10 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Featured Collection</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {featured.name}
                </h3>
              </div>
            </Link>
          )}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {smalls.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="relative aspect-square rounded-xl overflow-hidden p-4 flex items-end bg-slate-900 border border-slate-800 group hover:border-slate-700"
              >
                <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <h2
          data-editable="heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]"
          dangerouslySetInnerHTML={renderRich(heading)}
        />
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
