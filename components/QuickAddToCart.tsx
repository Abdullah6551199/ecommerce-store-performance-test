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

    // 2. Dispatch optimistic add to context and background request
    void addItem(productId, defaultVariantId, 1, {
      productName,
      productSlug,
      price,
      imageUrl,
      openOnSuccess: true,
    });
  };

  return (
    <button
      type="button"
      onClick={handleQuickAdd}
      disabled={isOutOfStock}
      title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
        isOutOfStock
          ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
          : addedNotice
          ? "bg-[#18C729] text-black shadow-lg shadow-[#18C729]/30"
          : "bg-white/10 text-white hover:bg-[#18C729] hover:text-black hover:shadow-lg hover:shadow-[#18C729]/20 active:scale-95"
      }`}
      style={{
        borderRadius: "var(--radius-btn, 0.75rem)",
      }}
    >
      {addedNotice ? (
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
  );
}
