"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  featuredImage: string | null;
  stock: number;
  status: string;
}

interface WishlistRecord {
  id: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
}

export default function AccountWishlistPage(): React.JSX.Element {
  const [items, setItems] = useState<WishlistRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, showToast, openDrawer } = useCart();

  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/customer/wishlist");
      if (res.ok) {
        const data = (await res.json()) as { items?: WishlistRecord[] };
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/customer/wishlist/${productId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.productId !== productId));
      showToast("Removed from wishlist", "success");
    } catch {
      showToast("Failed to remove item", "error");
    }
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    await addItem(product.id, null, 1);
    showToast(`Added "${product.name}" to cart!`, "success");
    openDrawer();
  };

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-2xl font-black text-[#3C0561] dark:text-white tracking-tight">
          My Saved Wishlist
        </h1>
        <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-0.5">
          Items synchronized across all your devices with your customer profile ({items.length} saved)
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-3xl bg-purple-100/50 dark:bg-purple-950/40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[#3C0561] dark:text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1 mb-6 max-w-sm mx-auto">
            Save technical activewear, shoes, and accessories you love to easily purchase them later.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Discover Products &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {items.map(({ id, productId, product }) => (
            <div
              key={id}
              className="p-4 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition space-y-3"
            >
              <div>
                <div className="relative aspect-square w-full rounded-2xl bg-purple-50/50 dark:bg-[#2A0344]/50 overflow-hidden mb-3 border border-purple-100 dark:border-purple-800/40">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs font-bold">
                      No Image
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(productId)}
                    className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-rose-500 hover:scale-110 shadow-sm transition"
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>
                </div>

                <Link
                  href={`/product/${product.slug || product.id}`}
                  className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#960DF2] dark:hover:text-[#EACFFC] line-clamp-2"
                >
                  {product.name}
                </Link>

                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-sm font-black text-[#960DF2] dark:text-[#EACFFC]">
                    Rs. {Number(product.price).toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xs text-slate-400 line-through">
                      Rs. {Number(product.compareAtPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                className="w-full py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <span>Move to Cart</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
