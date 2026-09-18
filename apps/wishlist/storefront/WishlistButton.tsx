"use client";

import React, { useState, useEffect } from "react";
import { useWishlist } from "@/components/WishlistContext";
import { WishlistAppSettings, DEFAULT_WISHLIST_SETTINGS } from "../shared/types";

export interface WishlistButtonProps {
  productId: string;
  productSlug?: string;
  productName?: string;
  price?: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  className?: string;
  variant?: "card" | "detail" | "inline";
}

export default function WishlistButton({
  productId,
  productSlug = "",
  productName = "Product",
  price = 0,
  salePrice = null,
  imageUrl = null,
  className = "",
  variant = "card",
}: WishlistButtonProps): React.JSX.Element | null {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [settings, setSettings] = useState<WishlistAppSettings>(DEFAULT_WISHLIST_SETTINGS);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchSettings() {
      try {
        const res = await fetch("/api/apps/wishlist/settings");
        if (res.ok) {
          const json = (await res.json()) as any;
          if (active) {
            if (json.data === null) {
              setIsEnabled(false);
            } else if (json.success && json.data) {
              setIsEnabled(true);
              setSettings({ ...DEFAULT_WISHLIST_SETTINGS, ...json.data });
            }
          }
        }
      } catch {
        // Fallback to default settings
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    fetchSettings();
    return () => {
      active = false;
    };
  }, []);

  const inWishlist = isInWishlist(productId);

  // If app is uninstalled or disabled
  if (!isEnabled) {
    return null;
  }

  // If card button is disabled in admin settings
  if (isLoaded && !settings.showOnProductCards && variant === "card") {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId,
      slug: productSlug || productId,
      name: productName,
      price: price || 0,
      salePrice,
      imageUrl,
    });
  };

  // 1. Detailed Product Page Button (Full width or action button)
  if (variant === "detail") {
    return (
      <div className={`w-full py-1 ${className}`}>
        <button
          type="button"
          onClick={handleClick}
          id="wishlist-product-toggle-btn"
          aria-label={inWishlist ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
          className={`w-full flex items-center justify-center gap-2.5 rounded-2xl py-3 px-5 font-bold text-xs shadow-sm transition-all duration-200 cursor-pointer border ${
            inWishlist
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 hover:bg-rose-100"
              : "bg-white dark:bg-[#1E0230] border-purple-200/70 dark:border-purple-800/60 text-purple-900 dark:text-purple-100 hover:border-purple-400 hover:scale-[1.01]"
          }`}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${
              inWishlist ? "fill-rose-500 text-rose-500 scale-110" : "fill-none text-purple-600 dark:text-purple-300"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            />
          </svg>
          <span>{inWishlist ? "Saved to Wishlist" : "Add to Wishlist"}</span>
        </button>
      </div>
    );
  }

  // 1b. Inline Pill Button
  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        id="wishlist-inline-toggle-btn"
        className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
          inWishlist
            ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
            : "border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-200 hover:border-purple-400"
        } ${className}`}
      >
        <svg
          className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : "fill-none"}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          />
        </svg>
        <span>{inWishlist ? "Saved" : "Wishlist"}</span>
      </button>
    );
  }

  // 2. Compact Product Card Heart Button
  const positionClass =
    settings.iconPosition === "top-left"
      ? "left-2.5 top-2.5"
      : settings.iconPosition === "below-image"
      ? "relative mt-2"
      : "right-2.5 top-2.5";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={inWishlist ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={`group relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 backdrop-blur-md shadow-sm cursor-pointer ${
        inWishlist
          ? "border-red-500/50 bg-red-50 dark:bg-red-950/80 text-red-500"
          : "border-zinc-200/80 dark:border-white/20 bg-white/80 dark:bg-black/60 text-zinc-600 dark:text-white/70 hover:text-red-500 hover:border-red-500/40 hover:scale-110"
      } ${variant === "card" ? positionClass : ""} ${className}`}
    >
      <svg
        className={`h-4 w-4 transition-transform duration-200 ${
          inWishlist ? "fill-red-500 text-red-500 scale-110" : "fill-none"
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={inWishlist ? 2.5 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        />
      </svg>
    </button>
  );
}
