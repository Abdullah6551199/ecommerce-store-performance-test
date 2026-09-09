"use client";

import React from "react";
import { useCart } from "@/components/CartContext";

/**
 * Isolated Client Island for Shopping Cart trigger & badge in Header.
 */
export default function CartNavButton(): React.JSX.Element {
  const { itemCount, openDrawer } = useCart();

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={openDrawer}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:scale-105 hover:border-[#18C729]/50 hover:bg-[#18C729]/10 cursor-pointer"
        aria-label="Open Shopping Cart"
        title={`Shopping Cart (${itemCount} items)`}
      >
        <svg
          className="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-[#18C729] to-[#FEF500] text-[10px] font-black text-black shadow-md animate-pulse">
            {itemCount}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={openDrawer}
        className="text-[10px] font-bold text-white/60 hover:text-[#18C729] mt-0.5 tracking-tight transition-colors cursor-pointer"
        title="View Cart Drawer"
      >
        View Cart
      </button>
    </div>
  );
}
