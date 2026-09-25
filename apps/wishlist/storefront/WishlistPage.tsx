"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { normalizeImageUrl } from "@/lib/utils";
import type { WishlistRecord } from "../shared/types";

export default function WishlistPage(): React.JSX.Element {
  const [items, setItems] = useState<WishlistRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, showToast, openDrawer } = useCart();
  const { items: localItems, removeFromWishlist } = useWishlist();

  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/customer/wishlist");
      if (res.ok) {
        const data = (await res.json()) as { items?: WishlistRecord[] };
        if (data.items && data.items.length > 0) {
          setItems(data.items);
          return;
        }
      }

      // Fallback: If customer has no DB items or is guest, render local context items
      const mappedLocal: WishlistRecord[] = localItems.map((li) => ({
        id: li.productId,
        productId: li.productId,
        createdAt: li.addedAt,
        product: {
          id: li.productId,
          name: li.name,
          slug: li.slug,
          price: li.price,
          compareAtPrice: li.salePrice,
          stock: 10,
          status: "active",
          mainImage: li.imageUrl,
        },
      }));
      setItems(mappedLocal);
    } catch (err) {
      console.warn("Failed to load wishlist:", err);
    } finally {
      setIsLoading(false);
    }
  }, [localItems]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId: string) => {
    try {
      // 1. Trigger backend delete
      await fetch(`/api/customer/wishlist/${productId}`, { method: "DELETE" }).catch(() => {});
      // 2. Trigger local context delete
      removeFromWishlist(productId);
      setItems((prev) => prev.filter((it) => it.productId !== productId));
      showToast("Removed from wishlist", "success");
    } catch {
      showToast("Failed to remove item", "error");
    }
  };

  const handleAddToCart = async (record: WishlistRecord) => {
    await addItem(record.product.id, null, 1);
    showToast(`Added "${record.product.name}" to cart!`, "success");
    openDrawer();
  };

  const handleAddAllToCart = async () => {
    for (const it of items) {
      await addItem(it.product.id, null, 1);
    }
    showToast("Added all available items to cart!", "success");
    openDrawer();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-800/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>My Wishlist</span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-mono font-bold text-[#25D366]">
              {items.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Saved items accessible across devices with your account profile.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleAddAllToCart}
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Add All to Cart</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#25D366] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-6 max-w-sm mx-auto">
            Save technical activewear, shoes, and accessories you love to easily purchase them later.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Discover Products &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {items.map((record) => {
            const prod = record.product;
            const effectivePrice = prod.price;
            const hasSale = Boolean(prod.compareAtPrice && prod.compareAtPrice > prod.price);
            const imageSrc = normalizeImageUrl(prod.mainImage, { width: 400, quality: 75 });

            return (
              <div
                key={record.id || record.productId}
                className="group p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition space-y-3"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-3 border border-zinc-200 dark:border-zinc-800">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={prod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs font-bold">
                        No Image
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(record.productId)}
                      className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-rose-500 hover:scale-110 shadow-sm transition cursor-pointer"
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                    {hasSale && (
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-[#25D366] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        SALE
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/product/${prod.slug || prod.id}`}
                    className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#25D366] line-clamp-2"
                  >
                    {prod.name}
                  </Link>

                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-sm font-black text-zinc-900 dark:text-white">
                      Rs. {Number(effectivePrice).toFixed(2)}
                    </span>
                    {hasSale && (
                      <span className="text-xs text-slate-400 line-through">
                        Rs. {Number(prod.compareAtPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart(record)}
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Move to Cart</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
