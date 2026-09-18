"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { normalizeImageUrl } from "@/lib/utils";
import CouponsSection from "@/components/CouponsSection";
import TrustBar from "@/components/homepage/TrustBar";
import TrustBadges from "@/components/TrustBadges";
import ProductCard from "@/components/ProductCard";
import StorefrontCartBelow from "@/components/apps/StorefrontCartBelow";
import type { ProductWithImagesAndCategory } from "@/lib/products";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
    clearCart,
    appliedCoupon,
    discountAmount,
    freeShippingCoupon,
  } = useCart();

  const [recommendedProducts, setRecommendedProducts] = useState<ProductWithImagesAndCategory[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    async function loadRecommendations() {
      setLoadingRecommendations(true);
      try {
        const res = await fetch("/api/products/search?limit=4&sort=popular");
        if (res.ok) {
          const json = (await res.json()) as any;
          if (json.success && Array.isArray(json.data)) {
            setRecommendedProducts(json.data);
          }
        }
      } catch (err) {
        console.warn("Error loading recommended products:", err);
      } finally {
        setLoadingRecommendations(false);
      }
    }
    loadRecommendations();
  }, []);

  const freeShippingThreshold = cart?.freeShippingThreshold || 100;
  const freeShippingRemaining = cart?.freeShippingRemaining ?? Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (isLoading) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-purple-100">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-4 w-32 bg-purple-100 dark:bg-purple-900/40 rounded-md" />
          <div className="h-8 w-56 bg-purple-100 dark:bg-purple-900/40 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-24 bg-purple-50 dark:bg-purple-950/40 rounded-3xl border border-purple-100 dark:border-purple-800" />
              <div className="h-48 bg-purple-50 dark:bg-purple-950/40 rounded-3xl border border-purple-100 dark:border-purple-800" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-72 bg-purple-50 dark:bg-purple-950/40 rounded-3xl border border-purple-100 dark:border-purple-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary name="Cart">
      <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-purple-100">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header Breadcrumbs */}
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-purple-300/70 mb-4">
              <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">Shopping Cart</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-purple-100 dark:border-purple-900/60 pb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-purple-950 dark:text-purple-100">
                  Shopping Cart
                </h1>
                <p className="text-xs text-purple-700 dark:text-purple-300/80 mt-1">
                  {itemCount} {itemCount === 1 ? "item" : "items"} currently in your bag
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>&larr; Continue Shopping</span>
              </Link>
            </div>
          </div>

          {items.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-purple-950/40 p-8 sm:p-14 text-center max-w-xl mx-auto my-8 shadow-xl shadow-purple-500/5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 mx-auto mb-6 text-purple-500 dark:text-purple-300">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-purple-950 dark:text-purple-100 mb-2">
                Your shopping cart is empty
              </h2>
              <p className="text-xs text-purple-700 dark:text-purple-300/80 mb-8 max-w-sm mx-auto leading-relaxed">
                Looks like you haven't added anything yet. Explore our latest arrivals and exclusive gear.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-2xl bg-[#960DF2] px-8 py-4 text-xs font-bold text-white shadow-xl shadow-purple-500/20 hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Browse Catalog &rarr;
              </Link>
            </div>
          ) : (
            /* Cart Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Items List */}
              <div className="lg:col-span-8 space-y-6">
                {/* Free Shipping Progress Bar */}
                <div className="rounded-3xl border border-purple-100 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 p-6">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-purple-900 dark:text-purple-200">
                      {freeShippingRemaining <= 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                          <span>🎉</span> Congratulations! You qualify for Free Shipping.
                        </span>
                      ) : (
                        <span>
                          Add <strong className="text-[#960DF2] dark:text-[#EACFFC]">${freeShippingRemaining.toFixed(2)}</strong> more to get Free Shipping
                        </span>
                      )}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-mono text-[11px]">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-purple-200/50 dark:bg-purple-900/40 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-[#960DF2] h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="rounded-3xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-purple-950/40 divide-y divide-purple-100 dark:divide-purple-900/60 overflow-hidden shadow-sm">
                  {items.map((item) => {
                    const imgUrl = item.imageUrl
                      ? normalizeImageUrl(item.imageUrl, { width: 160, quality: 75 })
                      : null;
                    const isOutOfStock = item.stockStatus === "out_of_stock";

                    return (
                      <div
                        key={item.id}
                        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors"
                      >
                        {/* Item Thumbnail */}
                        <Link
                          href={`/product/${item.productSlug}`}
                          className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30 flex-shrink-0 overflow-hidden"
                        >
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={item.productName}
                              fill
                              className="object-cover transition-transform hover:scale-105"
                              sizes="112px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-purple-400 text-xs">
                              No image
                            </div>
                          )}
                        </Link>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/product/${item.productSlug}`}
                              className="text-sm sm:text-base font-bold text-purple-950 dark:text-purple-100 hover:text-[#960DF2] dark:hover:text-[#EACFFC] transition-colors truncate"
                            >
                              {item.productName}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 transition-colors"
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.variantOptions).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="rounded bg-purple-50 dark:bg-purple-900/60 border border-purple-100 dark:border-purple-800 px-1.5 py-0.5 text-[10px] text-purple-700 dark:text-purple-300 font-medium"
                                >
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-purple-950 dark:text-purple-100 text-sm sm:text-base">
                              ${Number(item.unitPrice).toFixed(2)}
                            </span>
                          </div>

                          {isOutOfStock && (
                            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                              ⚠️ Item is currently out of stock
                            </p>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 pt-2">
                            <div className="inline-flex items-center rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/40 p-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-purple-800 dark:text-purple-200 hover:bg-white dark:hover:bg-purple-800 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-purple-950 dark:text-purple-100">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-purple-800 dark:text-purple-200 hover:bg-white dark:hover:bg-purple-800 transition cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-xs text-zinc-400">
                              Subtotal: <strong className="text-purple-950 dark:text-purple-100">${(Number(item.lineTotal || item.unitPrice * item.quantity)).toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Clear Cart Action */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    Clear shopping bag
                  </button>
                </div>
              </div>

              {/* Right Column: Summary & Checkout */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-3xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-purple-950/40 p-6 sm:p-8 space-y-6 shadow-xl shadow-purple-500/5">
                  <h2 className="text-lg font-bold text-purple-950 dark:text-purple-100 border-b border-purple-100 dark:border-purple-900/60 pb-4">
                    Order Summary
                  </h2>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-purple-800 dark:text-purple-200">
                      <span>Bag Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Coupon ({appliedCoupon.code})</span>
                        <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-purple-800 dark:text-purple-200">
                      <span>Estimated Shipping</span>
                      <span>
                        {freeShippingCoupon || freeShippingRemaining <= 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                        ) : (
                          "Calculated at checkout"
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-purple-800 dark:text-purple-200">
                      <span>Sales Tax</span>
                      <span>Calculated at checkout</span>
                    </div>

                    <div className="border-t border-purple-100 dark:border-purple-900/60 pt-3 flex justify-between text-sm sm:text-base font-black text-purple-950 dark:text-purple-100">
                      <span>Estimated Total</span>
                      <span className="text-[#960DF2] dark:text-[#EACFFC]">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="border-t border-purple-100 dark:border-purple-900/60 pt-4">
                    <CouponsSection />
                  </div>

                  {/* Proceed to Checkout CTA */}
                  <div className="pt-2">
                    <Link
                      href="/checkout"
                      className="w-full flex items-center justify-center rounded-2xl bg-[#960DF2] px-6 py-4 text-xs sm:text-sm font-bold text-white shadow-xl shadow-purple-500/25 hover:bg-purple-700 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      Proceed to Checkout &rarr;
                    </Link>
                    <StorefrontCartBelow />
                    <p className="text-[11px] text-center text-zinc-400 mt-2.5 flex items-center justify-center gap-1.5">
                      <span>🔒</span> Safe &amp; 256-Bit Encrypted Checkout
                    </p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="rounded-3xl border border-purple-100 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 p-6">
                  <TrustBadges />
                </div>
              </div>
            </div>
          )}

          {/* Store Trust Bar */}
          <div className="pt-6">
            <TrustBar />
          </div>

          {/* Recommended Products Showcase */}
          {recommendedProducts.length > 0 && (
            <section className="space-y-6 pt-6">
              <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/60 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Curated For You
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-purple-950 dark:text-purple-100">
                    You May Also Like
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  View Catalog →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
