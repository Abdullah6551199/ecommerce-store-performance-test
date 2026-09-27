"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";
import { useCart } from "@/components/CartContext";
import { renderRich } from "@/lib/themes/utils";

export interface ProductGridSettings {
  heading?: string;
  subheading?: string;
  product_ids?: string[];
  collection?: string;
  columns?: number;
  rows?: number;
  show_price?: boolean;
  show_rating?: boolean;
  show_add_to_cart?: boolean;
}

export default function ProductGrid({
  variant = "standard",
  settings = {},
  themeSettings,
  storeData,
}: SectionProps<ProductGridSettings>) {
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  const heading = settings.heading || "Featured Products";
  const subheading = settings.subheading || "Hand-picked favorites crafted for perfection";
  const columns = settings.columns || 4;
  const rows = settings.rows || 2;
  const limit = columns * rows;
  const showPrice = settings.show_price !== false;
  const showRating = settings.show_rating !== false;
  const showAddToCart = settings.show_add_to_cart !== false;

  const productsList = (storeData?.products || []).slice(0, limit);

  const colClasses: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  };

  const currentVariant = variant || (settings as any).variant || "standard";

  const gridClass =
    currentVariant === "bento"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[280px]"
      : currentVariant === "list_view"
      ? "grid-cols-1 gap-4"
      : colClasses[columns] || colClasses[4];

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(product.id);
    try {
      await addItem(product.id, null, 1, {
        productName: product.name,
        productSlug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        imageUrl: product.imageUrl || product.mainImage,
      });
    } finally {
      setTimeout(() => setAddingId(null), 600);
    }
  };

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12">
        <div>
          <h2
            data-editable="heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          {subheading && (
            <p
              data-editable="subheading"
              className="mt-2 text-sm sm:text-base text-[var(--theme-text-muted,#71717A)] font-[family-name:var(--theme-font-body)]"
              dangerouslySetInnerHTML={renderRich(subheading)}
            />
          )}
        </div>
        <Link
          href="/shop"
          className="mt-4 sm:mt-0 text-sm font-semibold text-[var(--theme-accent,#2563EB)] hover:underline inline-flex items-center gap-1"
        >
          View all products &rarr;
        </Link>
      </div>

      {/* Grid */}
      <div className={`grid gap-4 sm:gap-6 ${gridClass}`}>
        {productsList.map((product, idx) => {
          const currentPrice = product.salePrice ?? product.price;
          const isOnSale = product.salePrice && product.salePrice < product.price;
          const isBentoHero = currentVariant === "bento" && (idx === 0 || idx === 3);

          if (currentVariant === "list_view") {
            return (
              <div
                key={product.id}
                className="group flex flex-col sm:flex-row items-center gap-4 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] p-4 transition-all hover:shadow-md"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="relative aspect-square w-28 sm:w-36 rounded-lg overflow-hidden bg-[var(--theme-surface,#F4F4F5)] shrink-0"
                >
                  <Image
                    src={product.imageUrl || product.mainImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="160px"
                  />
                </Link>
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <Link
                    href={`/product/${product.slug}`}
                    className="font-bold text-base text-[var(--theme-text,#18181B)] hover:text-[var(--theme-accent,#2563EB)]"
                  >
                    {product.name}
                  </Link>
                  {showPrice && (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-base font-bold text-[var(--theme-text,#18181B)]">
                        ${currentPrice.toFixed(2)}
                      </span>
                      {isOnSale && (
                        <span className="text-xs text-[var(--theme-text-muted,#71717A)] line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {showAddToCart && (
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={addingId === product.id}
                    className="w-full sm:w-auto px-5 py-2 rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-xs font-semibold text-white hover:bg-[var(--theme-accent,#2563EB)] transition-colors"
                  >
                    {addingId === product.id ? "Added!" : "Add to Cart"}
                  </button>
                )}
              </div>
            );
          }

          return (
            <div
              key={product.id}
              className={`group relative flex flex-col rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] overflow-hidden transition-all hover:shadow-md hover:border-gray-300 ${
                isBentoHero ? "sm:col-span-2 row-span-2" : ""
              }`}
            >
              {/* Image Container */}
              <Link
                href={`/product/${product.slug}`}
                className="relative aspect-square w-full overflow-hidden bg-[var(--theme-surface,#F4F4F5)]"
              >
                <Image
                  src={product.imageUrl || product.mainImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"}
                  alt={product.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {isOnSale && (
                  <span className="absolute top-2 left-2 rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                    SALE
                  </span>
                )}
              </Link>

              {/* Product Info */}
              <div className="flex flex-1 flex-col p-4">
                <Link
                  href={`/product/${product.slug}`}
                  className="font-medium text-sm sm:text-base text-[var(--theme-text,#18181B)] hover:text-[var(--theme-accent,#2563EB)] line-clamp-1 transition-colors"
                >
                  {product.name}
                </Link>

                {showRating && (
                  <div className="mt-1 flex items-center gap-1 text-amber-400 text-xs">
                    {"★".repeat(product.rating || 5)}
                    <span className="text-[var(--theme-text-muted,#71717A)] ml-1">
                      ({product.reviewCount || 12})
                    </span>
                  </div>
                )}

                {showPrice && (
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-bold text-[var(--theme-text,#18181B)]">
                      ${currentPrice.toFixed(2)}
                    </span>
                    {isOnSale && (
                      <span className="text-xs text-[var(--theme-text-muted,#71717A)] line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}

                {showAddToCart && (
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={addingId === product.id}
                    className="mt-3 w-full rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] py-2 px-3 text-xs font-semibold text-white hover:bg-[var(--theme-accent,#2563EB)] transition-colors shadow-xs"
                  >
                    {addingId === product.id ? "Added!" : "Add to Cart"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
