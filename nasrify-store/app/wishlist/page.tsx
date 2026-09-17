"use client";

export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/components/WishlistContext";
import { normalizeImageUrl } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function WishlistPage(): React.JSX.Element {
  const {
    items,
    itemCount,
    isLoading,
    removeFromWishlist,
    addToCart,
    addAllToCart,
    clearWishlist,
  } = useWishlist();

  if (isLoading) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-purple-100">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-4 w-32 bg-purple-100 dark:bg-purple-900/40 rounded-md" />
          <div className="h-8 w-56 bg-purple-100 dark:bg-purple-900/40 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-purple-50 dark:bg-purple-950/40 rounded-3xl border border-purple-100 dark:border-purple-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary name="Wishlist">
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-purple-100">
        <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-purple-600/70 dark:text-purple-300/70 mb-6 font-medium">
          <Link href="/" className="hover:text-purple-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#3C0561] dark:text-[#EACFFC] font-bold">Wishlist</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-800/60 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3C0561] dark:text-[#EACFFC] flex items-center gap-2.5">
              <span>My Wishlist</span>
              <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-3 py-0.5 text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                {itemCount}
              </span>
            </h1>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80 mt-1">
              Your saved items are saved locally on your device so you can easily purchase them anytime.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearWishlist}
                className="rounded-xl border border-purple-200 dark:border-purple-700/60 px-4 py-2 text-xs font-semibold text-purple-700 dark:text-purple-200 hover:text-red-500 hover:border-red-500/30 transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={addAllToCart}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-400 hover:bg-purple-500 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-purple-400/20 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Add All to Cart</span>
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-[#3C0561] p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 mx-auto mb-6 text-purple-600 dark:text-purple-300">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#3C0561] dark:text-[#EACFFC] mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80 max-w-sm mx-auto mb-8">
              Explore our performance gear and tap the heart icon on any product to save it here for later.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-purple-400 hover:bg-purple-500 text-white px-8 py-3.5 text-sm font-bold shadow-lg shadow-purple-400/25 transition-all"
            >
              Start Browsing
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const effectivePrice = item.salePrice ?? item.price;
              const hasSale = Boolean(item.salePrice && item.salePrice < item.price);
              const resolvedImage = normalizeImageUrl(item.imageUrl, { width: 400, quality: 75 });

              return (
                <div
                  key={item.productId}
                  className="group relative flex flex-col justify-between rounded-3xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-[#3C0561] p-4 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-purple-50/50 dark:bg-purple-950/50 border border-purple-100/50 dark:border-purple-800/40">
                      <Image
                        src={resolvedImage}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Remove from Wishlist button */}
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.productId)}
                        aria-label="Remove item"
                        className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-[#3C0561]/90 text-zinc-500 dark:text-purple-200 shadow-md backdrop-blur-sm hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {hasSale && (
                        <span className="absolute top-2.5 left-2.5 rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          SALE
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mt-4 space-y-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="block font-bold text-sm text-[#3C0561] dark:text-white hover:text-purple-600 dark:hover:text-purple-300 transition-colors truncate"
                      >
                        {item.name}
                      </Link>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-[#3C0561] dark:text-white font-mono">
                          ${effectivePrice.toFixed(2)}
                        </span>
                        {hasSale && (
                          <span className="text-xs text-purple-400 dark:text-purple-300/60 line-through font-mono">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-purple-100 dark:border-purple-800/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addToCart(item.productId)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-400 hover:bg-purple-500 text-white py-2.5 px-3 text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
