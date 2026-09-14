"use client";

import React, { useState } from "react";
import { useCart } from "@/components/CartContext";
import type { BundleWithItems } from "@/lib/bundles";

interface BundleAddToCartButtonProps {
  bundle: BundleWithItems;
  className?: string;
}

export default function BundleAddToCartButton({
  bundle,
  className = "",
}: BundleAddToCartButtonProps): React.JSX.Element {
  const { addBundleToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addBundleToCart({
        id: bundle.id,
        name: bundle.name,
        bundlePrice: bundle.bundlePrice,
        originalPrice: bundle.originalPrice,
        items: bundle.items,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isAdding}
      onClick={handleAdd}
      className={`w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#960DF2] hover:bg-[#780AC2] active:scale-[0.98] py-4 px-8 text-base font-bold text-white shadow-xl shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50 ${className}`}
    >
      {isAdding ? (
        <span>Adding Bundle to Cart...</span>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Add Bundle to Cart (${bundle.bundlePrice.toFixed(2)})</span>
        </>
      )}
    </button>
  );
}
