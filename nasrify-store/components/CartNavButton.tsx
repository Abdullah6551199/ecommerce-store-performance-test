"use client";

import React from "react";
import { useCart } from "@/components/CartContext";

/**
 * Clean circular shopping cart icon button with item count badge.
 */
export default function CartNavButton(): React.JSX.Element {
  const { itemCount, openDrawer } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="group relative flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)] shadow-xs hover:border-[var(--theme-primary,#25D366)] hover:bg-[var(--theme-surface,#F4F4F5)] hover:text-[var(--theme-primary,#25D366)] active:scale-95 transition-all cursor-pointer"
      aria-label="Cart"
      title={`Shopping Cart (${itemCount} items)`}
    >
      {/* ShoppingBag Icon */}
      <svg
        className="h-5 w-5 text-[var(--theme-text,#18181B)] group-hover:text-[var(--theme-primary,#25D366)] transition-colors"
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

      {/* Item count badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--theme-primary,#25D366)] px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-75">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
