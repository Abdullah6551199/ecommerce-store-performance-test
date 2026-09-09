"use client";

import React, { useState } from "react";
import type { ProductWithImagesAndCategory } from "@/lib/products";

interface AddToCartSectionProps {
  product: ProductWithImagesAndCategory;
}

export default function AddToCartSection({ product }: AddToCartSectionProps): React.JSX.Element {
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const isOutOfStock =
    product.stockStatus === "out_of_stock" ||
    (product.trackInventory && product.stockQuantity <= 0 && !product.allowBackorders);

  const handleAdd = () => {
    if (isOutOfStock) return;
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2200);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      {/* Quantity Selector & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-1">
          <button
            type="button"
            disabled={quantity <= 1 || isOutOfStock}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors"
          >
            -
          </button>
          <span className="w-12 text-center text-sm font-bold text-white">
            {quantity}
          </span>
          <button
            type="button"
            disabled={isOutOfStock || (product.trackInventory && !product.allowBackorders && quantity >= product.stockQuantity)}
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-8 text-sm font-bold transition-all shadow-xl ${
            isOutOfStock
              ? "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
              : addedNotice
              ? "bg-[#18C729] text-black shadow-[#18C729]/30 scale-[1.02]"
              : "bg-gradient-to-r from-[#18C729] to-[#12a822] text-black shadow-[#18C729]/25 hover:brightness-110 active:scale-[0.98]"
          }`}
        >
          {addedNotice ? (
            <>
              <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Added to Cart ({quantity})</span>
            </>
          ) : isOutOfStock ? (
            <span>Sold Out</span>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
        <span>Stage 9 Checkout Ready • Cloudflare Workers Edge Delivery</span>
      </div>
    </div>
  );
}
