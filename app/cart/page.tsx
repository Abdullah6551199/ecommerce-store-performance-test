"use client";

export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { normalizeImageUrl } from "@/lib/utils";
import CouponsSection from "@/components/CouponsSection";

export default function CartPage(): React.JSX.Element {
  const {
    cart,
    items,
    itemCount,
    subtotal,
    total,
    isLoading,
    updateQuantity,
    removeItem,
    appliedCoupon,
    discountAmount,
    freeShippingCoupon,
  } = useCart();

  const freeShippingThreshold = cart?.freeShippingThreshold || 100;
  const freeShippingRemaining = cart?.freeShippingRemaining ?? Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (isLoading) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-white">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-white/10 rounded-md" />
          <div className="h-8 w-56 bg-zinc-200 dark:bg-white/10 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-24 bg-zinc-100 dark:bg-white/5 rounded-3xl border border-zinc-200 dark:border-white/10" />
              <div className="h-32 bg-zinc-100 dark:bg-white/5 rounded-3xl border border-zinc-200 dark:border-white/10" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-64 bg-zinc-100 dark:bg-white/5 rounded-3xl border border-zinc-200 dark:border-white/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-white/50 mb-6">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#18C729] font-medium">Shopping Cart</span>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="text-xs text-zinc-500 dark:text-white/50 mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-emerald-600 dark:text-[#18C729] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>&larr; Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-12 text-center max-w-xl mx-auto my-12 shadow-xl dark:shadow-none">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 mx-auto mb-6">
              <svg className="h-10 w-10 text-zinc-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Your shopping cart is empty</h2>
            <p className="text-xs text-zinc-500 dark:text-white/50 max-w-sm mx-auto mb-8">
              Looks like you haven&apos;t added any items to your cart yet. Check out our high-performance gear to get started!
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-8 py-3.5 text-sm font-bold text-black hover:brightness-110 shadow-lg shadow-[#18C729]/20 transition-all"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          /* 2-Column Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Bar */}
              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  {freeShippingRemaining > 0 ? (
                    <span className="text-zinc-700 dark:text-white/80">
                      Add <strong className="text-emerald-600 dark:text-[#FEF500]">${freeShippingRemaining.toFixed(2)}</strong> more to unlock <strong className="text-[#18C729]">FREE Shipping</strong>
                    </span>
                  ) : (
                    <span className="text-[#18C729] font-bold flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Congratulations! You unlocked FREE express delivery.
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-white/50">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-black/40">
                  <div
                    className="h-full bg-gradient-to-r from-[#18C729] to-[#FEF500] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 shadow-xl dark:shadow-none">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black/40">
                        <Image
                          src={normalizeImageUrl(item.imageUrl, { width: 200, quality: 75 })}
                          alt={item.productName}
                          fill
                          sizes="96px"
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.productSlug}`}
                          className="text-base font-bold text-zinc-900 dark:text-white hover:text-[#18C729] transition-colors block truncate"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs font-mono text-zinc-500 dark:text-white/40 mt-0.5">SKU: {item.sku}</p>

                        {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(item.variantOptions).map(([k, v]) => (
                              <span
                                key={k}
                                className="rounded-md bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 px-2 py-0.5 text-[11px] text-zinc-700 dark:text-white/70"
                              >
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs font-semibold text-zinc-800 dark:text-white/80 mt-2 sm:hidden">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-white/5">
                      <div className="hidden sm:block text-right">
                        <p className="text-xs text-zinc-500 dark:text-white/40 font-mono">${item.unitPrice.toFixed(2)}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-white/30">per unit</p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-black/30 p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-zinc-600 dark:text-white/70 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-zinc-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-zinc-600 dark:text-white/70 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-right min-w-[70px]">
                        <p className="text-base font-extrabold text-zinc-900 dark:text-white">
                          ${item.lineTotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 dark:text-white/40 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                        title="Remove from cart"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Column (4 cols) */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              {/* Coupons & Promotions Section */}
              <CouponsSection />

              <div className="rounded-3xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0c140f] p-6 shadow-xl dark:shadow-2xl space-y-5">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-white/10 pb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-white/70">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#18C729] font-bold">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>
                        {freeShippingCoupon
                          ? "FREE SHIPPING"
                          : `-$${discountAmount.toFixed(2)}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-600 dark:text-white/70">
                    <span>Shipping</span>
                    <span>{cart?.shipping === 0 ? <strong className="text-[#18C729]">FREE</strong> : `$${(cart?.shipping || 15).toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between text-zinc-600 dark:text-white/70">
                    <span>Estimated Sales Tax</span>
                    <span className="font-mono text-zinc-400 dark:text-white/50">$0.00</span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-zinc-900 dark:text-white pt-4 border-t border-zinc-200 dark:border-white/10">
                    <span>Total</span>
                    <span className="text-xl text-emerald-600 dark:text-[#FEF500]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#18C729] to-[#12a822] py-4 text-sm font-bold text-black hover:brightness-110 shadow-xl shadow-[#18C729]/25 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <div className="pt-4 border-t border-zinc-200 dark:border-white/5 space-y-2 text-[11px] text-zinc-500 dark:text-white/50">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
                    <span>Free shipping on all orders over $100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
                    <span>30-day hassle-free returns &amp; exchanges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
                    <span>Encrypted &amp; fast secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
