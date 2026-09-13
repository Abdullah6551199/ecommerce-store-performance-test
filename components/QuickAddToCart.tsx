"use client";

import React, { useState } from "react";
import { useCart } from "@/components/CartContext";

interface QuickAddToCartProps {
  productId: string;
  productSlug: string;
  isOutOfStock: boolean;
  defaultVariantId?: string | null;
  hasMultipleVariants?: boolean;
  productName?: string;
  price?: number;
  imageUrl?: string | null;
  stockQuantity?: number;
  className?: string;
}

/**
 * Isolated Client Island for Quick Add-to-Cart button in Product Cards.
 * Leaves the ProductCard itself 100% server-rendered.
 * Optimistic UI: No loading spinners, instantaneous badge & drawer update.
 */
export default function QuickAddToCart({
  productId,
  productSlug,
  isOutOfStock,
  defaultVariantId = null,
  hasMultipleVariants = false,
  productName,
  price,
  imageUrl,
  stockQuantity,
  className = "",
}: QuickAddToCartProps): React.JSX.Element {
  const { addItem } = useCart();
  const [addedNotice, setAddedNotice] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    if (hasMultipleVariants) {
      window.location.href = `/product/${productSlug}`;
      return;
    }

    // 1. Immediately trigger optimistic feedback
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1600);

    // 2. Dispatch pure client-side add to context (0ms, zero D1 hits)
    void addItem(productId, defaultVariantId, 1, {
      productName,
      productSlug,
      price,
      imageUrl,
      stockQuantity: stockQuantity ?? 99,
      openOnSuccess: true,
    });
  };

  return (
    <button
      type="button"
      onClick={handleQuickAdd}
      disabled={isOutOfStock}
      title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
        isOutOfStock
          ? "bg-zinc-100 dark:bg-purple-950/40 text-zinc-400 dark:text-purple-400 cursor-not-allowed border border-zinc-200 dark:border-purple-800/40"
          : addedNotice
          ? "bg-[#780AC2] text-white shadow-md shadow-purple-500/30"
          : "bg-[#960DF2] hover:bg-[#780AC2] text-white shadow-sm hover:shadow-md hover:shadow-purple-500/25 active:scale-95"
      } ${className}`}
    >
      {addedNotice ? (
        <>
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Added!</span>
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Add</span>
        </>
      )}
    </button>
  );
}
