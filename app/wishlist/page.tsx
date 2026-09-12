"use client";

export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/components/WishlistContext";
import { normalizeImageUrl } from "@/lib/utils";

export default function WishlistPage(): React.JSX.Element {
  const {
    items,
    itemCount,
    isLoading,
    removeFromWishlist,
    moveToCart,
    addAllToCart,
    clearWishlist,
  } = useWishlist();

  if (isLoading) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-white">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-white/10 rounded-md" />
          <div className="h-8 w-56 bg-zinc-200 dark:bg-white/10 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-zinc-100 dark:bg-white/5 rounded-3xl border border-zinc-200 dark:border-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-white/50 mb-6">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-red-500 font-semibold">Wishlist</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <span>My Wishlist</span>
              <span className="rounded-full bg-red-500/15 px-3 py-0.5 text-xs font-mono font-bold text-red-500">
                {itemCount}
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-white/50 mt-1">
              Your saved items are saved locally on your device so you can easily purchase them anytime.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearWishlist}
                className="rounded-xl border border-zinc-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-white/60 hover:text-red-500 hover:border-red-500/30 transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={addAllToCart}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-5 py-2.5 text-xs font-bold text-black hover:brightness-110 shadow-lg shadow-[#18C729]/20 transition-all cursor-pointer"
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
          <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 mx-auto mb-6 text-red-500">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-xs text-zinc-500 dark:text-white/50 max-w-sm mx-auto mb-8">
              Explore our performance gear and tap the heart icon on any product to save it here for later.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-8 py-3.5 text-sm font-bold text-black hover:brightness-110 shadow-lg shadow-[#18C729]/20 transition-all"
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
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-[#0c140f]/80 p-4 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Top image & remove button */}
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black/40">
                      {resolvedImage ? (
                        <Image
                          src={resolvedImage}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-white/30">
                          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.productId)}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-black/60 text-zinc-600 dark:text-white/70 hover:text-red-500 hover:bg-white dark:hover:bg-black backdrop-blur-md border border-zinc-200/80 dark:border-white/20 transition-all shadow-sm cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {hasSale && (
                        <span className="absolute top-3 left-3 rounded-full border border-red-500/30 bg-red-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-md">
                          SALE
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mt-4 space-y-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="block font-bold text-sm text-zinc-900 dark:text-white hover:text-[#18C729] transition-colors truncate"
                      >
                        {item.name}
                      </Link>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                          ${effectivePrice.toFixed(2)}
                        </span>
                        {hasSale && (
                          <span className="text-xs text-zinc-400 dark:text-white/40 line-through font-mono">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-zinc-200/60 dark:border-white/5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveToCart(item.productId)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] py-2.5 px-3 text-xs font-bold text-black hover:brightness-110 shadow-sm transition-all cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
