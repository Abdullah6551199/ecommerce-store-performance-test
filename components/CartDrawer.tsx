"use client";

import React, { useEffect, useRef, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { normalizeImageUrl } from "@/lib/utils";
import CouponsSection from "./CouponsSection";

interface CartDrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Isolated Memoized Outer Panel
 * Isolates the fixed sliding drawer panel from cart item state updates.
 * Adding or modifying products does NOT cause this outer wrapper to re-render,
 * eliminating any transform recalculation or slider bounce.
 */
const CartDrawerPanel = memo(function CartDrawerPanel({
  isOpen,
  onClose,
  children,
}: CartDrawerPanelProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside drawer to close smoothly without blocking page interactions
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, onClose]);

  return (
    <aside
      aria-label="Shopping Cart Drawer"
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 pointer-events-none ${
        isOpen ? "visible" : "invisible"
      }`}
    >
      <div
        ref={drawerRef}
        key="cart-drawer-panel"
        style={{
          width: "320px",
          minWidth: "320px",
          maxWidth: "320px",
          willChange: "transform",
        }}
        className={`fixed top-0 right-0 bottom-0 w-[320px] max-w-[320px] bg-white dark:bg-[#09100c] text-zinc-900 dark:text-white border-l border-zinc-200 dark:border-white/15 shadow-[-12px_0_40px_rgba(0,0,0,0.15)] dark:shadow-[-12px_0_40px_rgba(0,0,0,0.85)] flex flex-col justify-between pointer-events-auto transition-transform duration-300 ease-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {children}
      </div>
    </aside>
  );
});

export default function CartDrawer(): React.JSX.Element {
  const {
    cart,
    items,
    itemCount,
    subtotal,
    total,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    appliedCoupon,
    discountAmount,
    freeShippingCoupon,
  } = useCart();

  const freeShippingThreshold = cart?.freeShippingThreshold || 100;
  const freeShippingRemaining =
    cart?.freeShippingRemaining ?? Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <CartDrawerPanel isOpen={isDrawerOpen} onClose={closeDrawer}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#18C729]/15 text-[#18C729]">
            <svg
              className="h-3.5 w-3.5"
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
          </div>
          <h2 className="text-xs font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <span>Your Cart</span>
            <span className="rounded-full bg-[#18C729]/20 px-1.5 py-0.2 text-[9px] font-mono text-[#18C729]">
              {itemCount}
            </span>
          </h2>
        </div>

        <button
          type="button"
          onClick={closeDrawer}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Close cart drawer"
          title="Close Cart"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="px-4 py-1.5 bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 shrink-0">
        <div className="flex items-center justify-between text-[10px] mb-0.5">
          {freeShippingRemaining > 0 ? (
            <span className="text-zinc-700 dark:text-white/80">
              Add <strong className="text-emerald-600 dark:text-[#FEF500]">${freeShippingRemaining.toFixed(2)}</strong> for{" "}
              <strong className="text-[#18C729]">FREE Shipping</strong>
            </span>
          ) : (
            <span className="text-[#18C729] font-bold flex items-center gap-1">
              ✓ FREE Delivery Unlocked!
            </span>
          )}
          <span className="text-[9px] font-mono text-zinc-500 dark:text-white/50">{progressPercent}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-black/50">
          <div
            className="h-full bg-gradient-to-r from-[#18C729] to-[#FEF500] transition-[width] duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cart Items List - min-h-[180px], permanent scrollbar track with overflow-y-scroll */}
      <div className="flex-1 min-h-[180px] overflow-y-scroll px-3 py-2 space-y-2 [scrollbar-gutter:stable]">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 mb-2">
              <svg
                className="h-6 w-6 text-zinc-400 dark:text-white/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-0.5">Your cart is empty</h3>
            <p className="text-[11px] text-zinc-500 dark:text-white/50 max-w-xs mb-3">
              Explore our catalog to add athletic apparel and footwear.
            </p>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-4 py-2 min-h-[36px] inline-flex items-center justify-center text-xs font-bold text-black hover:brightness-110 transition-colors shadow-md shadow-[#18C729]/20"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-2 transition-colors"
            >
              {/* Product Thumbnail (h-12 w-12) */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black/40">
                <Image
                  src={normalizeImageUrl(item.imageUrl, { width: 96, quality: 75 })}
                  alt={item.productName}
                  fill
                  sizes="48px"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <Link
                      href={`/product/${item.productSlug}`}
                      onClick={closeDrawer}
                      className="text-xs font-bold text-zinc-900 dark:text-white hover:text-[#18C729] transition-colors truncate block"
                      title={item.productName}
                    >
                      {item.productName}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 dark:text-white/40 hover:text-red-500 p-0.5 transition-colors shrink-0"
                      title="Remove item"
                      aria-label={`Remove ${item.productName}`}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {Object.entries(item.variantOptions).map(([key, val]) => (
                        <span
                          key={key}
                          className="rounded bg-zinc-200 dark:bg-black/40 px-1 py-0.2 text-[9px] text-zinc-600 dark:text-white/60 font-medium"
                        >
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantity Controls (h-6 w-6) & Price */}
                <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-zinc-200 dark:border-white/5">
                  <div className="flex items-center rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/30">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center text-xs font-bold text-zinc-600 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white rounded-l-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="min-w-[20px] text-center text-[11px] font-bold text-zinc-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center text-xs font-bold text-zinc-600 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white rounded-r-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[11px] font-extrabold text-zinc-900 dark:text-white">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Summary & Checkout */}
      {items.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/40 p-3 space-y-2 shrink-0">
          {/* Simplified Drawer Coupon UI */}
          <CouponsSection compact={true} />

          {/* Compact Order Summary */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-zinc-600 dark:text-white/70">
              <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span className="font-semibold text-zinc-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-[#18C729] font-bold">
                <span>Discount ({appliedCoupon.code})</span>
                <span>{freeShippingCoupon ? "FREE" : `-$${discountAmount.toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600 dark:text-white/70">
              <span>Shipping</span>
              <span>
                {cart?.shipping === 0 ? (
                  <strong className="text-[#18C729]">FREE</strong>
                ) : (
                  `$${(cart?.shipping || 15).toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-zinc-900 dark:text-white pt-1 border-t border-zinc-200 dark:border-white/10">
              <span>Total</span>
              <span className="text-emerald-600 dark:text-[#FEF500]">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5 pt-0.5">
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] py-2 text-xs font-bold text-black hover:brightness-110 shadow-md shadow-[#18C729]/20 transition-colors cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/cart"
              onClick={closeDrawer}
              className="w-full min-h-[32px] inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-100 dark:bg-white/5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
            >
              View Full Cart
            </Link>
          </div>
        </div>
      )}
    </CartDrawerPanel>
  );
}
