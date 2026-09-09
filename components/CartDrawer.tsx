"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { normalizeImageUrl } from "@/lib/utils";

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
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Handle click outside drawer to close smoothly without blocking page interactions
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDrawer();
      }
    };

    // Use capture phase so outside clicks dismiss drawer
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  // NOTE: Body scroll is intentionally NOT locked so user can freely continue browsing and shopping!

  const freeShippingThreshold = cart?.freeShippingThreshold || 100;
  const freeShippingRemaining =
    cart?.freeShippingRemaining ?? Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <aside
      aria-label="Shopping Cart Drawer"
      aria-hidden={!isDrawerOpen}
      className={`fixed inset-0 z-50 pointer-events-none transition-visibility duration-300 ${
        isDrawerOpen ? "visible" : "invisible"
      }`}
    >
      {/* Subtle non-blocking backdrop indicator - light transparent shade that clicks to close */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/30 pointer-events-auto transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-in compact drawer panel (max width 400px) */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[400px] max-w-[420px] bg-[#09100c] border-l border-white/15 shadow-[-12px_0_40px_rgba(0,0,0,0.85)] flex flex-col justify-between pointer-events-auto transform transition-transform duration-300 ease-out z-10 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729]">
              <svg
                className="h-4 w-4"
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
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>Your Cart</span>
                <span className="rounded-full bg-[#18C729]/20 px-2 py-0.5 text-[10px] font-mono text-[#18C729]">
                  {itemCount}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-8 px-2.5 items-center justify-center gap-1 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Continue shopping and close cart"
              title="Continue Shopping"
            >
              <span>Keep Browsing</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-5 py-2.5 bg-white/5 border-b border-white/10">
          <div className="flex items-center justify-between text-[11px] mb-1">
            {freeShippingRemaining > 0 ? (
              <span className="text-white/80">
                Add <strong className="text-[#FEF500]">${freeShippingRemaining.toFixed(2)}</strong> for{" "}
                <strong className="text-[#18C729]">FREE Shipping</strong>
              </span>
            ) : (
              <span className="text-[#18C729] font-bold flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                FREE Delivery Unlocked!
              </span>
            )}
            <span className="text-[10px] font-mono text-white/50">{progressPercent}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-black/50">
            <div
              className="h-full bg-gradient-to-r from-[#18C729] to-[#FEF500] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-3">
                <svg
                  className="h-8 w-8 text-white/30"
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
              <h3 className="text-sm font-bold text-white mb-1">Your cart is empty</h3>
              <p className="text-xs text-white/50 max-w-xs mb-4">
                Explore our catalog to add athletic apparel and footwear.
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-5 py-2 text-xs font-bold text-black hover:brightness-110 transition-all shadow-md shadow-[#18C729]/20"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-white/20 transition-all"
              >
                {/* Product Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={normalizeImageUrl(item.imageUrl)}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={closeDrawer}
                        className="text-xs font-bold text-white hover:text-[#18C729] transition-colors line-clamp-1"
                        title={item.productName}
                      >
                        {item.productName}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-white/40 hover:text-red-400 p-0.5 transition-colors"
                        title="Remove item"
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
                            className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white/60 font-medium"
                          >
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity Selector & Price */}
                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-white/5">
                    <div className="flex items-center rounded-lg border border-white/15 bg-black/30">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center text-xs text-white/70 hover:bg-white/10 hover:text-white rounded-l-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center text-xs text-white/70 hover:bg-white/10 hover:text-white rounded-r-lg transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-white/10 bg-black/40 p-4 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>
                  {cart?.shipping === 0 ? (
                    <strong className="text-[#18C729]">FREE</strong>
                  ) : (
                    `$${(cart?.shipping || 15).toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-white/10">
                <span>Total</span>
                <span className="text-[#FEF500]">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-0.5">
              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] py-3 text-xs font-bold text-black hover:brightness-110 shadow-lg shadow-[#18C729]/20 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              {/* View Cart & Continue Shopping buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-white hover:bg-white/10 transition-all"
                >
                  Full Cart
                </Link>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-transparent py-2 text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  Keep Shopping
                </button>
              </div>
            </div>

            <p className="text-center text-[9px] text-white/40">
              ⚡ Edge Powered • Cash on Delivery Available
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
