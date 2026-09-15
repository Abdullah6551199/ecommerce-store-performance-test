"use client";

import React from "react";
import { useWishlist } from "@/components/WishlistContext";

interface WishlistHeartButtonProps {
  product: {
    productId: string;
    slug: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
  };
  className?: string;
}

export default function WishlistHeartButton({
  product,
  className = "",
}: WishlistHeartButtonProps): React.JSX.Element {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={`group relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 backdrop-blur-md shadow-sm cursor-pointer ${
        inWishlist
          ? "border-red-500/50 bg-red-50 dark:bg-red-950/80 text-red-500"
          : "border-zinc-200/80 dark:border-white/20 bg-white/80 dark:bg-black/60 text-zinc-600 dark:text-white/70 hover:text-red-500 hover:border-red-500/40 hover:scale-110"
      } ${className}`}
    >
      <svg
        className={`h-4 w-4 transition-transform duration-200 ${
          inWishlist ? "fill-red-500 text-red-500 scale-110 animate-in zoom-in-50" : "fill-none"
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={inWishlist ? 2.5 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
