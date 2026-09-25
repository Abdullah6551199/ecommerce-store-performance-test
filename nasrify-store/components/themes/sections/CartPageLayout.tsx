"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";
import { useCart } from "@/components/CartContext";
import { normalizeImageUrl } from "@/lib/utils";
import CouponsSection from "@/components/CouponsSection";
import TrustBar from "@/components/homepage/TrustBar";
import TrustBadges from "@/components/TrustBadges";
import ProductCard from "../blocks/ProductCard";
import Button from "../blocks/Button";
import StorefrontCartBelow from "@/components/apps/StorefrontCartBelow";
import type { ProductWithImagesAndCategory } from "@/lib/products";

export interface CartPageLayoutSettings {
  show_coupon?: boolean;
  show_estimated_shipping?: boolean;
  show_recommendations?: boolean;
}

export default function CartPageLayout({
  settings = {},
}: SectionProps<CartPageLayoutSettings>) {
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

  useEffect(() => {
    if (settings.show_recommendations === false) return;
    async function loadRecommendations() {
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
      }
    }
    loadRecommendations();
  }, [settings.show_recommendations]);

  const freeShippingThreshold = cart?.freeShippingThreshold || 100;
  const freeShippingRemaining = cart?.freeShippingRemaining ?? Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (isLoading) {
    return (
      <div className="py-10 animate-pulse space-y-6">
        <div className="h-4 w-32 bg-[var(--theme-surface,#F4F4F5)] rounded-md" />
        <div className="h-8 w-56 bg-[var(--theme-surface,#F4F4F5)] rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-24 bg-[var(--theme-surface,#F4F4F5)] rounded-2xl border border-[var(--theme-border,#E4E4E7)]" />
            <div className="h-48 bg-[var(--theme-surface,#F4F4F5)] rounded-2xl border border-[var(--theme-border,#E4E4E7)]" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-72 bg-[var(--theme-surface,#F4F4F5)] rounded-2xl border border-[var(--theme-border,#E4E4E7)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 font-[family-name:var(--theme-font-body)]">
      {/* Header Breadcrumbs */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--theme-text-muted,#71717A)] mb-4">
          <Link href="/" className="hover:text-[var(--theme-primary,#25D366)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--theme-text,#18181B)] font-semibold">Shopping Cart</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--theme-border,#E4E4E7)] pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
              Shopping Cart
            </h1>
            <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"} currently in your bag
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] hover:underline flex items-center gap-1 font-semibold transition-colors"
          >
            <span>&larr; Continue Shopping</span>
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-[var(--theme-border,#E4E4E7)] bg-white p-8 sm:p-14 text-center max-w-xl mx-auto my-8 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)] mx-auto mb-6 text-[var(--theme-text-muted,#71717A)]">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--theme-text,#18181B)] mb-2 font-[family-name:var(--theme-font-heading)]">
            Your shopping cart is empty
          </h2>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)] mb-8 max-w-sm mx-auto leading-relaxed">
            Looks like you haven&apos;t added anything yet. Explore our latest arrivals and exclusive gear.
          </p>
          <Link href="/shop">
            <Button variant="primary" size="lg">
              Browse Catalog &rarr;
            </Button>
          </Link>
        </div>
      ) : (
        /* Cart Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items List */}
          <div className="lg:col-span-8 space-y-6">
            {/* Free Shipping Progress Bar */}
            <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-6">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-[var(--theme-text,#18181B)]">
                  {freeShippingRemaining <= 0 ? (
                    <span className="text-[var(--theme-primary,#25D366)] font-bold flex items-center gap-1.5">
                      <span>🎉</span> Congratulations! You qualify for Free Shipping.
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-[var(--theme-primary,#25D366)]">${freeShippingRemaining.toFixed(2)}</strong> more to get Free Shipping
                    </span>
                  )}
                </span>
                <span className="text-[var(--theme-text-muted,#71717A)] font-mono text-[11px]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[var(--theme-border,#E4E4E7)] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[var(--theme-primary,#25D366)] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white divide-y divide-[var(--theme-border,#E4E4E7)] overflow-hidden shadow-sm">
              {items.map((item) => {
                const rawImg =
                  item.imageUrl ||
                  (item as any).image ||
                  (item as any).productImage ||
                  (item as any).mainImage ||
                  "";
                const imgUrl = rawImg
                  ? normalizeImageUrl(rawImg, { width: 160, quality: 75 })
                  : "/placeholder.png";
                const isOutOfStock = item.stockStatus === "out_of_stock";

                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-[var(--theme-surface,#F4F4F5)]/50 transition-colors"
                  >
                    {/* Item Thumbnail */}
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="relative block h-24 w-24 sm:h-28 sm:w-28 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] shrink-0 overflow-hidden"
                    >
                      <Image
                        src={imgUrl}
                        alt={item.productName || "Product"}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.productSlug}`}
                          className="text-sm sm:text-base font-bold text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] transition-colors truncate"
                        >
                          {item.productName}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[var(--theme-text-muted,#71717A)] hover:text-rose-500 p-1 transition-colors cursor-pointer"
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
                              className="rounded bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)] px-1.5 py-0.5 text-[10px] text-[var(--theme-text-muted,#71717A)] font-medium"
                            >
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[var(--theme-text,#18181B)] text-sm sm:text-base font-mono">
                          ${Number(item.unitPrice).toFixed(2)}
                        </span>
                      </div>

                      {isOutOfStock && (
                        <p className="text-[11px] text-rose-600 font-semibold">
                          ⚠️ Item is currently out of stock
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="inline-flex items-center rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--theme-text,#18181B)] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer font-bold text-xs"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[var(--theme-text,#18181B)] font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--theme-text,#18181B)] hover:bg-white transition cursor-pointer font-bold text-xs"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs text-[var(--theme-text-muted,#71717A)]">
                          Subtotal: <strong className="text-[var(--theme-text,#18181B)] font-mono">${(Number(item.lineTotal || item.unitPrice * item.quantity)).toFixed(2)}</strong>
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
                className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                Clear shopping bag
              </button>
            </div>
          </div>

          {/* Right Column: Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--theme-text,#18181B)] border-b border-[var(--theme-border,#E4E4E7)] pb-4 font-[family-name:var(--theme-font-heading)]">
                Order Summary
              </h2>

              {/* Pricing Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[var(--theme-text-muted,#71717A)]">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-[var(--theme-text,#18181B)] font-mono">${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[var(--theme-primary,#25D366)] font-semibold">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[var(--theme-text-muted,#71717A)]">
                  <span>Estimated Shipping</span>
                  <span>
                    {freeShippingCoupon || freeShippingRemaining <= 0 ? (
                      <span className="text-[var(--theme-primary,#25D366)] font-bold">FREE</span>
                    ) : (
                      "Calculated at checkout"
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-[var(--theme-text-muted,#71717A)]">
                  <span>Sales Tax</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="border-t border-[var(--theme-border,#E4E4E7)] pt-3 flex justify-between text-base font-black text-[var(--theme-text,#18181B)]">
                  <span>Estimated Total</span>
                  <span className="text-[var(--theme-primary,#25D366)] font-mono">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Code Section */}
              {settings.show_coupon !== false && (
                <div className="border-t border-[var(--theme-border,#E4E4E7)] pt-4">
                  <CouponsSection />
                </div>
              )}

              {/* Proceed to Checkout CTA */}
              <div className="pt-2 space-y-3">
                <Link href="/checkout" className="block w-full">
                  <Button variant="primary" size="lg" fullWidth>
                    Proceed to Checkout &rarr;
                  </Button>
                </Link>
                <StorefrontCartBelow />
                <p className="text-[11px] text-center text-[var(--theme-text-muted,#71717A)] flex items-center justify-center gap-1.5">
                  <span>🔒</span> Safe &amp; 256-Bit Encrypted Checkout
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-6">
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
          <div className="flex items-center justify-between border-b border-[var(--theme-border,#E4E4E7)] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-primary,#25D366)]">
                Curated For You
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] transition-colors hover:underline"
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
  );
}
