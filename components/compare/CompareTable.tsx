"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useCompare, MAX_COMPARE_LIMIT } from "@/components/CompareContext";
import { useCart } from "@/components/CartContext";
import { normalizeImageUrl } from "@/lib/utils";
import type { CompareProductItem } from "@/app/api/products/compare/route";

export default function CompareTable(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();

  const [products, setProducts] = useState<CompareProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  // Modal for adding another product
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Read IDs from query string OR fallback to compareList context
  const idsQuery = searchParams.get("ids");
  const activeIds = idsQuery
    ? idsQuery.split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX_COMPARE_LIMIT)
    : compareList;

  // Sync query params if user has items in context but URL has none
  useEffect(() => {
    if (!idsQuery && compareList.length > 0) {
      router.replace(`/compare?ids=${compareList.join(",")}`);
    }
  }, [idsQuery, compareList, router]);

  // Load product comparison data
  useEffect(() => {
    if (activeIds.length === 0) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/products/compare?ids=${activeIds.join(",")}`)
      .then((res) => res.json() as Promise<any>)
      .then((data: any) => {
        if (data?.success && Array.isArray(data?.products)) {
          setProducts(data.products);
        }
      })
      .catch((err) => {
        console.error("Error fetching compare data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeIds.join(",")]);

  // Live product search in modal
  useEffect(() => {
    if (!isSearchOpen || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=8`)
        .then((res) => res.json() as Promise<any>)
        .then((data: any) => {
          if (data?.success && Array.isArray(data?.products)) {
            setSearchResults(data.products);
          }
        })
        .catch((err) => console.warn("Search error:", err))
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen]);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleAddToCart = async (product: CompareProductItem) => {
    setAddingId(product.id);
    try {
      await addItem(product.id, null, 1, {
        productName: product.name,
        price: product.price,
        salePrice: product.salePrice,
        stockQuantity: product.stockQuantity,
        openOnSuccess: true,
      });
    } finally {
      setAddingId(null);
    }
  };

  // Compute lowest price to highlight differences
  const lowestPrice =
    products.length > 1
      ? Math.min(...products.map((p) => (p.salePrice ? p.salePrice : p.price)))
      : null;

  // Collect all specification keys
  const specKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specifications || {})))
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#960DF2] border-r-transparent" />
        <p className="text-sm font-semibold text-purple-600 dark:text-purple-300">
          Loading comparison data...
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-100 dark:bg-purple-900/40 text-[#960DF2] dark:text-[#C06EF7]">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#3C0561] dark:text-white">
            No Products Selected to Compare
          </h1>
          <p className="text-sm text-purple-700/80 dark:text-purple-200/70">
            Browse our athletic catalog and click the &quot;Compare&quot; button on up to 4 items to evaluate specs, pricing, and ratings side-by-side.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-[#960DF2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:bg-[#780AC2] transition-all"
          >
            <span>Explore Catalog</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-purple-200/70 dark:border-purple-800/50 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3C0561] dark:text-white flex items-center gap-3">
            <span>Compare Products</span>
            <span className="rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-0.5 text-xs font-bold text-[#960DF2] dark:text-[#C06EF7]">
              {products.length} of {MAX_COMPARE_LIMIT}
            </span>
          </h1>
          <p className="text-xs text-purple-700/80 dark:text-purple-300 mt-1">
            Side-by-side analysis of specifications, performance ratings, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length < MAX_COMPARE_LIMIT && (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-[#3C0561] px-3.5 py-2 text-xs font-semibold text-purple-700 dark:text-purple-200 hover:border-purple-400 shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Product</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-[#3C0561] px-3.5 py-2 text-xs font-semibold text-purple-700 dark:text-purple-200 hover:border-purple-400 shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>{copiedShare ? "Link Copied!" : "Share Link"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              clearCompare();
              router.replace("/compare");
            }}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-purple-200/80 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/90 shadow-xl backdrop-blur-md">
        <table className="w-full min-w-[650px] border-collapse text-left text-xs">
          <thead>
            {/* Header: Images & Names & Remove */}
            <tr className="border-b border-purple-200/60 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/40">
              <th className="w-48 p-4 font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                Product
              </th>
              {products.map((p) => {
                const img = p.image ? normalizeImageUrl(p.image, { width: 320, quality: 80 }) : null;
                return (
                  <th key={p.id} className="p-4 align-top w-64">
                    <div className="space-y-3">
                      <div className="relative aspect-square w-full max-w-[180px] mx-auto overflow-hidden rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/40">
                        {img ? (
                          <Image
                            src={img}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="180px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-purple-400">
                            No Image
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            removeFromCompare(p.id);
                            const nextIds = activeIds.filter((id) => id !== p.id);
                            router.replace(`/compare?ids=${nextIds.join(",")}`);
                          }}
                          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition"
                          title="Remove product"
                        >
                          ×
                        </button>
                      </div>

                      <div className="text-center space-y-1">
                        <Link
                          href={`/product/${p.slug}`}
                          className="font-bold text-sm text-[#3C0561] dark:text-white hover:text-[#960DF2] transition line-clamp-2"
                        >
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-purple-400 font-medium">{p.brand}</p>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-purple-100 dark:divide-purple-800/40 text-[#3C0561] dark:text-purple-100">
            {/* Row: Price & Differences */}
            <tr>
              <td className="p-4 font-bold bg-purple-50/20 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200">
                Price
              </td>
              {products.map((p) => {
                const effPrice = p.salePrice || p.price;
                const isBestPrice = lowestPrice !== null && effPrice === lowestPrice;

                return (
                  <td key={`price-${p.id}`} className="p-4 align-middle">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-[#960DF2] dark:text-[#C06EF7]">
                          ${effPrice.toFixed(2)}
                        </span>
                        {p.salePrice && (
                          <span className="text-xs text-zinc-400 line-through">
                            ${p.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {isBestPrice && products.length > 1 && (
                        <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                          Best Price
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row: Rating */}
            <tr>
              <td className="p-4 font-bold bg-purple-50/20 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200">
                Customer Rating
              </td>
              {products.map((p) => (
                <td key={`rating-${p.id}`} className="p-4 align-middle">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400 text-xs">
                      {"★".repeat(Math.round(p.rating))}
                      {"☆".repeat(Math.max(0, 5 - Math.round(p.rating)))}
                    </div>
                    <span className="font-bold text-xs">{p.rating.toFixed(1)}</span>
                    <span className="text-[11px] text-purple-400">({p.reviewCount})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row: Stock Status */}
            <tr>
              <td className="p-4 font-bold bg-purple-50/20 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200">
                Stock Status
              </td>
              {products.map((p) => {
                const inStock = p.stockStatus === "in_stock" && p.stockQuantity > 0;
                return (
                  <td key={`stock-${p.id}`} className="p-4 align-middle">
                    {inStock ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>In Stock</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <span>Out of Stock</span>
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row: Category */}
            <tr>
              <td className="p-4 font-bold bg-purple-50/20 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200">
                Category
              </td>
              {products.map((p) => (
                <td key={`cat-${p.id}`} className="p-4 align-middle font-medium">
                  {p.category || "General"}
                </td>
              ))}
            </tr>

            {/* Dynamic Specification Rows */}
            {specKeys.map((key) => (
              <tr key={`spec-row-${key}`}>
                <td className="p-4 font-bold bg-purple-50/20 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200">
                  {key}
                </td>
                {products.map((p) => (
                  <td key={`spec-${key}-${p.id}`} className="p-4 align-middle">
                    {p.specifications[key] || "—"}
                  </td>
                ))}
              </tr>
            ))}

            {/* Row: Short Description */}
            <tr>
              <td className="p-4 font-bold bg-purple-50/20 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200">
                Description
              </td>
              {products.map((p) => (
                <td key={`desc-${p.id}`} className="p-4 align-top text-[11px] leading-relaxed text-zinc-600 dark:text-purple-200/80">
                  {p.shortDescription || "No summary available."}
                </td>
              ))}
            </tr>

            {/* Row: Add to Cart */}
            <tr className="bg-purple-50/30 dark:bg-purple-950/30">
              <td className="p-4 font-bold text-purple-900 dark:text-purple-200">
                Action
              </td>
              {products.map((p) => {
                const isOutOfStock = p.stockStatus === "out_of_stock" || p.stockQuantity <= 0;
                return (
                  <td key={`action-${p.id}`} className="p-4 align-middle">
                    <button
                      type="button"
                      disabled={isOutOfStock || addingId === p.id}
                      onClick={() => handleAddToCart(p)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#960DF2] hover:bg-[#780AC2] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {addingId === p.id ? (
                        <span>Adding...</span>
                      ) : isOutOfStock ? (
                        <span>Sold Out</span>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Product Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#3C0561] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-200/60 dark:border-purple-800/40 pb-3">
              <h2 className="text-base font-bold text-[#3C0561] dark:text-white">
                Add Product to Compare
              </h2>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-purple-400 hover:text-purple-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/50 px-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-[#960DF2]"
              />
              {isSearching && (
                <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-[#960DF2] border-r-transparent" />
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-purple-100 dark:divide-purple-800/30">
              {searchResults.length === 0 && searchQuery && !isSearching && (
                <p className="text-center text-xs text-purple-400 py-6">
                  No matching products found.
                </p>
              )}
              {searchResults.map((p) => {
                const isSelected = activeIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between pt-2 pb-1 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-purple-50">
                        {p.mainImage && (
                          <Image
                            src={normalizeImageUrl(p.mainImage, { width: 80, quality: 70 })}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#3C0561] dark:text-white line-clamp-1">
                          {p.name}
                        </p>
                        <p className="text-[11px] font-semibold text-[#960DF2] dark:text-[#C06EF7]">
                          ${Number(p.salePrice || p.price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSelected}
                      onClick={() => {
                        addToCompare(p.id);
                        setIsSearchOpen(false);
                        const nextIds = [...activeIds, p.id];
                        router.replace(`/compare?ids=${nextIds.join(",")}`);
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        isSelected
                          ? "bg-purple-100 dark:bg-purple-900/40 text-purple-400 cursor-not-allowed"
                          : "bg-[#960DF2] hover:bg-[#780AC2] text-white cursor-pointer"
                      }`}
                    >
                      {isSelected ? "Added" : "Select"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
