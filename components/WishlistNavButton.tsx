"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistContext";

/**
 * Isolated Client Island for Wishlist trigger & badge in Header.
 */
export default function WishlistNavButton(): React.JSX.Element {
  const { itemCount } = useWishlist();

  return (
    <Link
      href="/wishlist"
      className="group relative flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-black/5 dark:bg-white/5 px-2.5 py-1 transition-all hover:scale-105 hover:border-red-500/50 hover:bg-red-500/10 cursor-pointer"
      aria-label={`Wishlist, ${itemCount} items`}
      title={`Wishlist (${itemCount} items)`}
    >
      <div className="relative flex items-center justify-center">
        <svg
          className={`h-4 w-4 transition-colors ${
            itemCount > 0
              ? "text-red-500 fill-red-500 group-hover:text-red-600"
              : "text-zinc-800 dark:text-white group-hover:text-red-500"
          }`}
          fill={itemCount > 0 ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-3.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-md animate-pulse">
            {itemCount}
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold text-zinc-600 dark:text-white/60 group-hover:text-red-500 leading-tight mt-0.5 tracking-tight transition-colors">
        Wishlist
      </span>
    </Link>
  );
}
