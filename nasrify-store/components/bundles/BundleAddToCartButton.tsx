"use client";

import React, { useState } from "react";
import { useCart } from "@/components/CartContext";
import type { BundleWithItems } from "@/lib/bundles";
import Button from "@/components/themes/blocks/Button";

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
    <Button
      variant="primary"
      size="lg"
      disabled={isAdding}
      onClick={handleAdd}
      className={`w-full justify-center text-base py-4 ${className}`}
    >
      {isAdding ? (
        <span>Adding Bundle to Cart...</span>
      ) : (
        <>
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Add Bundle to Cart (${bundle.bundlePrice.toFixed(2)})</span>
        </>
      )}
    </Button>
  );
}
