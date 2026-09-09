"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ProductWithImagesAndCategory } from "@/lib/products";
import { normalizeImageUrl } from "@/lib/utils";
import { useCart } from "@/components/CartContext";

interface ProductCardProps {
  product: ProductWithImagesAndCategory;
}

export default function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const hasSale = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasSale
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    // If product has multiple options/variants, redirect to product page to choose options
    if (product.variants && product.variants.length > 1) {
      window.location.href = `/product/${product.slug}`;
      return;
    }

    const defaultVariant = product.variants?.[0]?.id || null;
    setIsAdding(true);
    try {
      const success = await addItem(product.id, defaultVariant, 1, true);
      if (success) {
        setAddedNotice(true);
        setTimeout(() => setAddedNotice(false), 1800);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = product.stockStatus === "out_of_stock" || (product.trackInventory && product.stockQuantity <= 0 && !product.allowBackorders);
  const isLowStock = !isOutOfStock && product.trackInventory && product.stockQuantity <= product.lowStockThreshold;

  const resolvedImage = normalizeImageUrl(product.mainImage);

  return (
    <div
      className="group relative flex flex-col overflow-hidden border border-white/10 bg-[#0c140f]/80 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl"
      style={{ borderRadius: "var(--radius-card, 1.5rem)" }}
    >
      {/* Product Image Link Container */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/4] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        {resolvedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02] p-4 text-center">
            <svg className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="mt-2 text-[10px] text-white/40 font-mono">No Image</span>
          </div>
        )}

        {/* Gradient dark overlay on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {hasSale && (
            <span className="rounded-full border border-red-500/30 bg-red-500/80 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-md">
              -{discountPercent}% OFF
            </span>
          )}
          {product.brand && (
            <span className="rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md">
              {product.brand}
            </span>
          )}
        </div>

        {/* Stock status indicator pill */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="rounded-full bg-red-950/80 border border-red-500/40 px-2 py-0.5 text-[10px] font-semibold text-red-300 backdrop-blur-md">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-md">
              Low Stock
            </span>
          ) : null}
        </div>
      </Link>

      {/* Product Content Container */}
      <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
        <div>
          {product.categoryName && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              {product.categoryName}
            </span>
          )}
          <h3 className="mt-0.5 text-sm font-bold text-white group-hover:text-[#18C729] transition-colors line-clamp-1">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          {product.shortDescription && (
            <p className="mt-1 text-xs text-white/50 line-clamp-2">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price & Action Area */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {hasSale ? (
              <>
                <span
                  className="text-base font-extrabold"
                  style={{ color: "var(--color-primary, #18C729)" }}
                >
                  ${Number(product.salePrice).toFixed(2)}
                </span>
                <span className="text-xs text-white/40 line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-base font-extrabold text-white">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isOutOfStock || isAdding
                ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                : addedNotice
                ? "bg-[#18C729] text-black shadow-lg shadow-[#18C729]/30"
                : "bg-white/10 text-white hover:bg-[#18C729] hover:text-black hover:shadow-lg hover:shadow-[#18C729]/20 active:scale-95"
            }`}
            style={{
              borderRadius: "var(--radius-btn, 0.75rem)",
            }}
          >
            {isAdding ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : addedNotice ? (
              <>
                <svg className="h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Added!</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
