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
            <p className="text-xs text-zinc-500 dark:text-purple-300/70 max-w-sm mx-auto mb-8">
              Looks like you haven&apos;t added any items to your cart yet. Check out our high-performance gear to get started!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          /* 2-Column Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Products Table & Cart Controls (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Dynamic Progress Bar */}
              <div className="rounded-2xl border border-purple-100 dark:border-purple-800/80 bg-purple-50/70 dark:bg-purple-950/40 p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  {freeShippingRemaining > 0 ? (
                    <span className="text-purple-900 dark:text-purple-200">
                      Add <strong className="text-purple-700 dark:text-purple-300 font-bold">${freeShippingRemaining.toFixed(2)}</strong> more to unlock <strong className="text-purple-600 dark:text-purple-400 font-bold">FREE Worldwide Shipping</strong>
                    </span>
                  ) : (
                    <span className="text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Congratulations! You unlocked FREE express delivery.
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-purple-200 dark:bg-purple-950">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Products Table Card */}
              <div className="rounded-3xl border border-purple-100 dark:border-purple-800/80 bg-white dark:bg-purple-950/30 overflow-hidden shadow-sm">
                {/* Table Header (Hidden on small mobile) */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-purple-50/60 dark:bg-purple-900/40 border-b border-purple-100 dark:border-purple-800 text-[11px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-purple-100 dark:divide-purple-900/50">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      {/* Product (Col 1-6) */}
                      <div className="col-span-6 flex items-center gap-4 w-full">
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-400 dark:text-purple-300/50 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                          title="Remove item"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* Thumbnail */}
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60">
                          <Image
                            src={normalizeImageUrl(item.imageUrl, { width: 160, quality: 75 })}
                            alt={item.productName}
                            fill
                            sizes="80px"
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/product/${item.productSlug}`}
                            className="text-sm font-bold text-zinc-900 dark:text-purple-100 hover:text-purple-600 dark:hover:text-purple-300 transition-colors block truncate"
                          >
                            {item.productName}
                          </Link>
                          {item.sku && (
                            <p className="text-[10px] font-mono text-zinc-400 dark:text-purple-400/60 mt-0.5">
                              SKU: {item.sku}
                            </p>
                          )}

                          {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {Object.entries(item.variantOptions).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="rounded bg-purple-50 dark:bg-purple-900/60 border border-purple-100 dark:border-purple-800 px-1.5 py-0.5 text-[9px] text-purple-700 dark:text-purple-300 font-medium"
                                >
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-2 sm:hidden">
                            ${item.unitPrice.toFixed(2)} each
                          </p>
                        </div>
                      </div>

                      {/* Unit Price (Col 7-8) */}
                      <div className="hidden sm:block col-span-2 text-center text-xs font-mono text-zinc-600 dark:text-purple-300">
                        ${item.unitPrice.toFixed(2)}
                      </div>

                      {/* Quantity Stepper (Col 9-10) */}
                      <div className="col-span-2 flex items-center justify-between sm:justify-center w-full sm:w-auto">
                        <span className="sm:hidden text-xs text-zinc-500 dark:text-purple-300/70">Quantity:</span>
                        <div className="flex items-center rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/60 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors font-bold text-xs"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-purple-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors font-bold text-xs"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Line Subtotal (Col 11-12) */}
                      <div className="col-span-2 flex items-center justify-between sm:justify-end w-full sm:w-auto text-right">
                        <span className="sm:hidden text-xs text-zinc-500 dark:text-purple-300/70">Total:</span>
                        <span className="text-sm font-black text-purple-900 dark:text-purple-100">
                          ${item.lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Footer Actions */}
                <div className="p-4 sm:p-6 bg-purple-50/30 dark:bg-purple-950/20 border-t border-purple-100 dark:border-purple-800/80 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear your shopping cart?")) {
                        clearCart();
                      }
                    }}
                    className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline flex items-center gap-1.5"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Shopping Cart</span>
                  </button>

                  <Link
                    href="/shop"
                    className="rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-900/40 px-4 py-2 text-xs font-semibold text-purple-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-800/60 transition-colors"
                  >
                    Continue Shopping →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Order Summary & Checkout (4 cols) */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              {/* Coupons & Promotions Section */}
              <CouponsSection />

              {/* Order Summary Card */}
              <div className="rounded-3xl border border-purple-100 dark:border-purple-800/80 bg-white dark:bg-purple-950/40 p-6 shadow-xl shadow-purple-500/5 space-y-5">
                <h2 className="text-base font-bold text-purple-950 dark:text-purple-100 border-b border-purple-100 dark:border-purple-900 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-purple-300/80">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                    <span className="font-semibold text-zinc-900 dark:text-purple-100">${subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-purple-600 dark:text-purple-400 font-bold">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>
                        {freeShippingCoupon
                          ? "FREE SHIPPING"
                          : `-$${discountAmount.toFixed(2)}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-600 dark:text-purple-300/80">
                    <span>Shipping</span>
                    <span>{cart?.shipping === 0 ? <strong className="text-purple-600 dark:text-purple-400 font-bold">FREE</strong> : `$${(cart?.shipping || 15).toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between text-zinc-600 dark:text-purple-300/80">
                    <span>Estimated Sales Tax</span>
                    <span className="font-mono text-zinc-400 dark:text-purple-400/60">$0.00</span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-purple-950 dark:text-purple-100 pt-3 border-t border-purple-100 dark:border-purple-900">
                    <span>Total</span>
                    <span className="text-xl text-purple-700 dark:text-purple-300 font-black">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust Badges Row (Stage 22 Part A: 4 badges above Proceed to Checkout) */}
                <div className="pt-2">
                  <TrustBadges location="cart" limit={4} variant="compact" />
                </div>

                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <div className="pt-3 border-t border-purple-100 dark:border-purple-900/60 space-y-2 text-[11px] text-zinc-500 dark:text-purple-300/70">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Free worldwide shipping on orders over $100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>30-day hassle-free returns &amp; exchanges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>256-bit encrypted checkout guarantee</span>
                  </div>
                </div>
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
  );
}
