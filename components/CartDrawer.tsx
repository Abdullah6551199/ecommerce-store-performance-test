"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
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
 * Isolated Memoized Outer Panel (Portal + CSS Containment)
 * Decouples the drawer from the React tree by rendering directly into document.body.
 * Animation is 100% CSS-driven with hardware acceleration and layout isolation
 * (contain: layout style paint), preventing any bounce when products are added.
 */
const CartDrawerPanel = memo(function CartDrawerPanel({
  isOpen,
  onClose,
  children,
}: CartDrawerPanelProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return createPortal(
    <div
      ref={drawerRef}
      id="cart-drawer-panel"
      aria-label="Shopping Cart Drawer"
      aria-hidden={!isOpen}
      className={`cart-drawer-panel bg-white dark:bg-[#3C0561] text-zinc-900 dark:text-purple-100 border-l border-purple-100 dark:border-purple-800 shadow-[-12px_0_40px_rgba(60,5,97,0.12)] dark:shadow-[-12px_0_40px_rgba(0,0,0,0.85)] flex flex-col justify-between z-50 ${
        isOpen ? "open drawer-open" : "drawer-closed"
      }`}
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        visibility: isOpen ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    document.body
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
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
          <h2 className="text-xs font-extrabold text-purple-950 dark:text-purple-100 tracking-tight flex items-center gap-1.5">
            <span>Your Cart</span>
            <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.2 text-[9px] font-mono text-purple-700 dark:text-purple-300">
              {itemCount}
            </span>
          </h2>
        </div>

        <button
          type="button"
          onClick={closeDrawer}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          aria-label="Close cart drawer"
          title="Close Cart"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="px-4 py-2 bg-purple-50/70 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-800/80 shrink-0">
        <div className="flex items-center justify-between text-[10px] mb-1">
          {freeShippingRemaining > 0 ? (
            <span className="text-purple-900 dark:text-purple-200">
              Add <strong className="text-purple-700 dark:text-purple-300 font-bold">${freeShippingRemaining.toFixed(2)}</strong> for{" "}
              <strong className="text-purple-600 dark:text-purple-400 font-bold">FREE Shipping</strong>
            </span>
          ) : (
            <span className="text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
              ✓ FREE Delivery Unlocked!
            </span>
          )}
          <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-semibold">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-purple-200 dark:bg-purple-950">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-[width] duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 min-h-[180px] overflow-y-scroll px-3 py-2 space-y-2 [scrollbar-gutter:stable]">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 mb-2">
              <svg
                className="h-6 w-6 text-purple-400 dark:text-purple-300"
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
            <h3 className="text-xs font-bold text-zinc-900 dark:text-purple-100 mb-0.5">Your cart is empty</h3>
            <p className="text-[11px] text-zinc-500 dark:text-purple-300/70 max-w-xs mb-3">
              Explore our catalog to add athletic apparel and footwear.
            </p>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 min-h-[36px] inline-flex items-center justify-center text-xs font-bold transition-all shadow-md shadow-purple-500/25"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-2.5 rounded-xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-purple-900/30 p-2 transition-colors hover:border-purple-300"
            >
              {/* Product Thumbnail (h-12 w-12) */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60">
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
                      className="text-xs font-bold text-zinc-900 dark:text-purple-100 hover:text-purple-600 dark:hover:text-purple-300 transition-colors truncate block"
                      title={item.productName}
                    >
                      {item.productName}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 dark:text-purple-300/50 hover:text-red-500 p-0.5 transition-colors shrink-0"
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
                          className="rounded bg-purple-50 dark:bg-purple-950/60 px-1 py-0.2 text-[9px] text-purple-700 dark:text-purple-300 font-medium"
                        >
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-purple-100 dark:border-purple-800/40">
                  <div className="flex items-center rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/60">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-l-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="min-w-[20px] text-center text-[11px] font-bold text-zinc-900 dark:text-purple-100">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-r-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[11px] font-extrabold text-purple-900 dark:text-purple-200">
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
        <div className="border-t border-purple-100 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/60 p-3 space-y-2 shrink-0">
          {/* Simplified Drawer Coupon UI */}
          <CouponsSection compact={true} />

          {/* Compact Order Summary */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-zinc-600 dark:text-purple-300/80">
              <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span className="font-semibold text-zinc-900 dark:text-purple-100">${subtotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-purple-600 dark:text-purple-400 font-bold">
                <span>Discount ({appliedCoupon.code})</span>
                <span>{freeShippingCoupon ? "FREE" : `-$${discountAmount.toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600 dark:text-purple-300/80">
              <span>Shipping</span>
              <span>
                {cart?.shipping === 0 ? (
                  <strong className="text-purple-600 dark:text-purple-400">FREE</strong>
                ) : (
                  `$${(cart?.shipping || 15).toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-zinc-900 dark:text-purple-100 pt-1 border-t border-purple-100 dark:border-purple-800/60">
              <span>Total</span>
              <span className="text-purple-700 dark:text-purple-300 text-sm">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5 pt-0.5">
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-2 text-xs font-bold shadow-md shadow-purple-500/25 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/cart"
              onClick={closeDrawer}
              className="w-full min-h-[32px] inline-flex items-center justify-center rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-900/40 py-1.5 text-xs font-semibold text-purple-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-800/50 transition-colors"
            >
              View Full Cart
            </Link>
          </div>
        </div>
      )}
    </CartDrawerPanel>
  );
}
