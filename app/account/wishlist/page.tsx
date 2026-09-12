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
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          My Saved Wishlist
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Items synced across your devices with your account
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-zinc-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Save items you like to easily find them later and receive stock alerts.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#18C729] text-black font-bold text-xs hover:bg-[#15af24]"
          >
            Discover Products &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(({ id, productId, product }) => (
            <div
              key={id}
              className="p-4 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-white/20 transition space-y-3"
            >
              <div>
                <div className="relative aspect-square w-full rounded-2xl bg-zinc-100 dark:bg-white/5 overflow-hidden mb-3">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400 text-xs">
                      No Image
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(productId)}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md text-red-500 hover:scale-110 shadow-sm transition"
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>
                </div>

                <Link
                  href={`/product/${product.slug || product.id}`}
                  className="text-xs font-bold text-zinc-900 dark:text-white hover:text-[#18C729] line-clamp-2"
                >
                  {product.name}
                </Link>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-black text-[#18C729]">
                    Rs. {Number(product.price).toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xs text-zinc-400 line-through">
                      Rs. {Number(product.compareAtPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                className="w-full py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-extrabold text-xs hover:bg-[#18C729] dark:hover:bg-[#18C729] hover:text-black transition flex items-center justify-center gap-1.5"
              >
                <span>Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
