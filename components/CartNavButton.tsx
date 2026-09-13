"use client";

import React from "react";
import { useCart } from "@/components/CartContext";

/**
 * Isolated Client Island for Shopping Cart trigger & badge in Header.
 */
export default function CartNavButton(): React.JSX.Element {
  const { itemCount, openDrawer } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="group relative flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-xl border border-purple-300/60 dark:border-purple-800/40 bg-white/50 dark:bg-white/5 px-2.5 py-1 transition-all hover:scale-105 hover:border-purple-400 hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer shadow-sm"
      aria-label={`Shopping Cart, ${itemCount} items`}
      title={`Shopping Cart (${itemCount} items)`}
    >
      <div className="relative flex items-center justify-center">
        <svg
          className="h-4 w-4 text-[#3C0561] dark:text-white group-hover:text-[#960DF2] transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-3.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#960DF2] text-[9px] font-black text-white shadow-md animate-pulse">
            {itemCount}
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold text-[#3C0561] dark:text-purple-200/70 group-hover:text-[#960DF2] leading-tight mt-0.5 tracking-tight transition-colors">
        Cart
      </span>
    </button>
  );
}
