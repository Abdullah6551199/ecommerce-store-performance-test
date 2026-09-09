"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { normalizeImageUrl } from "@/lib/utils";

export default function CartDrawer(): React.JSX.Element | null {
  const { cart, items, itemCount, subtotal, total, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();
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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = cart?.freeShippingThreshold || 100;
  const freeShippingRemaining = cart?.freeShippingRemaining ?? Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop overlay */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          ref={drawerRef}
          className="relative w-screen max-w-md bg-[#0a110c] border-l border-white/10 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Your Cart</h2>
                <p className="text-xs text-white/50">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close cart"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              {freeShippingRemaining > 0 ? (
                <span className="text-white/80">
                  Add <strong className="text-[#FEF500]">${freeShippingRemaining.toFixed(2)}</strong> more for <strong className="text-[#18C729]">FREE Shipping</strong>
                </span>
              ) : (
                <span className="text-[#18C729] font-bold flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Unlocked Free Standard Delivery!
                </span>
              )}
              <span className="text-[10px] font-mono text-white/50">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full bg-gradient-to-r from-[#18C729] to-[#FEF500] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 mb-4">
                  <svg className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Your cart is empty</h3>
                <p className="text-xs text-white/50 max-w-xs mb-6">
                  Explore our high-performance catalog and gear up with cutting-edge athletic wear.
                </p>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-6 py-2.5 text-xs font-bold text-black hover:brightness-110 transition-all shadow-lg shadow-[#18C729]/20"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:border-white/20 transition-all"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
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
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.productSlug}`}
                          onClick={closeDrawer}
                          className="text-xs font-bold text-white hover:text-[#18C729] transition-colors truncate"
                        >
                          {item.productName}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-white/40 hover:text-red-400 p-0.5 transition-colors"
                          title="Remove item"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {Object.entries(item.variantOptions).map(([key, val]) => (
                            <span
                              key={key}
                              className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/60 font-medium"
                            >
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector & Price */}
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5">
                      <div className="flex items-center rounded-lg border border-white/15 bg-black/30">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-white/70 hover:bg-white/10 hover:text-white rounded-l-lg transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-white/70 hover:bg-white/10 hover:text-white rounded-r-lg transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-white">
                          ${item.lineTotal.toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-white/40 font-mono">
                            ${item.unitPrice.toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-white/10 bg-black/30 p-6 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Estimated Shipping</span>
                  <span>{cart?.shipping === 0 ? <strong className="text-[#18C729]">FREE</strong> : `$${(cart?.shipping || 10).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[#FEF500]">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10 hover:border-white/25 transition-all"
                >
                  View Full Cart & Review
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    alert("Ready for Stage 10 Checkout Integration!");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] py-3.5 text-sm font-bold text-black hover:brightness-110 shadow-lg shadow-[#18C729]/20 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              <p className="text-center text-[10px] text-white/40">
                🔒 Secure Edge Processing • Powered by Cloudflare D1 & Workers
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
