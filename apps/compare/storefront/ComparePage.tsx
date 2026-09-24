"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCompare } from "@/components/CompareContext";
import { useCart } from "@/components/CartContext";
import { normalizeImageUrl } from "@/lib/utils";
import Button from "@/components/themes/blocks/Button";

const MAX_COMPARE_LIMIT = 4;

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  image?: string | null;
  brand?: string | null;
  category?: string | null;
  rating: number;
  reviewCount: number;
  stockStatus: string;
  stockQuantity: number;
  specifications: Record<string, string>;
  shortDescription?: string | null;
}

export default function ComparePageClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useCompare();
  const { addItem, showToast, openDrawer } = useCart();

  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Search dialog state for adding 3rd/4th product directly on this page
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Read IDs from either URL params (shareable) or localStorage CompareContext
  const queryIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  const activeIds = queryIds.length > 0 ? queryIds : compareList;

  useEffect(() => {
    if (activeIds.length === 0) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/compare/products?ids=${activeIds.slice(0, MAX_COMPARE_LIMIT).join(",")}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching compare products:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeIds.join(",")]);

  // Live search debounce for adding product
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=6`);
        const json = (await res.json()) as any;
        if (json.success && Array.isArray(json.data)) {
          setSearchResults(json.data);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddToCart = async (p: CompareProduct) => {
    setAddingId(p.id);
    try {
      await addItem(p.id, null, 1, {
        productName: p.name,
        productSlug: p.slug,
        price: p.salePrice || p.price,
        imageUrl: p.image || null,
      });
      showToast(`${p.name} added to your cart!`, "success");
      openDrawer();
    } finally {
      setAddingId(null);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/compare?ids=${products.map((p) => p.id).join(",")}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Find lowest price among compared products for highlighting
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
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4 font-[family-name:var(--theme-font-body)]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--theme-primary,#25D366)] border-r-transparent" />
        <p className="text-sm font-semibold text-[var(--theme-text-muted,#71717A)]">
          Loading comparison data...
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-6 font-[family-name:var(--theme-font-body)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text-muted,#71717A)]">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            No Products Selected to Compare
          </h1>
          <p className="text-sm text-[var(--theme-text-muted,#71717A)]">
            Browse our catalog and click the &quot;Compare&quot; button on up to 4 items to evaluate specs, pricing, and ratings side-by-side.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/shop">
            <Button variant="primary" size="md">
              <span>Explore Catalog &rarr;</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--theme-border,#E4E4E7)] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--theme-text,#18181B)] flex items-center gap-3 font-[family-name:var(--theme-font-heading)]">
            <span>Compare Products</span>
            <span className="rounded-full bg-[var(--theme-surface,#F4F4F5)] px-3 py-0.5 text-xs font-bold text-[var(--theme-primary,#25D366)]">
              {products.length} of {MAX_COMPARE_LIMIT}
            </span>
          </h1>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1">
            Side-by-side analysis of specifications, performance ratings, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length < MAX_COMPARE_LIMIT && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
            >
              <span>+ Add Product</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <span>{copiedShare ? "Link Copied!" : "Share Link"}</span>
          </Button>

          <button
            type="button"
            onClick={() => {
              clearCompare();
              router.replace("/compare");
            }}
            className="text-xs font-semibold text-rose-600 hover:underline px-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm">
        <table className="w-full min-w-[650px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)]">
              <th className="w-48 p-4 font-bold text-[var(--theme-text,#18181B)] uppercase tracking-wider font-[family-name:var(--theme-font-heading)]">
                Product
              </th>
              {products.map((p) => {
                const img = p.image ? normalizeImageUrl(p.image, { width: 320, quality: 80 }) : null;
                return (
                  <th key={p.id} className="p-4 align-top w-64">
                    <div className="space-y-3">
                      <div className="relative aspect-square w-full max-w-[180px] mx-auto overflow-hidden rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)]">
                        {img ? (
                          <Image
                            src={img}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="180px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--theme-text-muted,#71717A)]">
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
                          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition cursor-pointer font-bold"
                          title="Remove product"
                        >
                          ×
                        </button>
                      </div>

                      <div className="text-center space-y-1">
                        <Link
                          href={`/product/${p.slug}`}
                          className="font-bold text-sm text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] transition line-clamp-2"
                        >
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-[var(--theme-text-muted,#71717A)] font-medium">{p.brand}</p>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--theme-border,#E4E4E7)] text-[var(--theme-text,#18181B)]">
            {/* Price */}
            <tr>
              <td className="p-4 font-bold bg-[var(--theme-surface,#F4F4F5)]/50 text-[var(--theme-text,#18181B)]">
                Price
              </td>
              {products.map((p) => {
                const effPrice = p.salePrice || p.price;
                const isBestPrice = lowestPrice !== null && effPrice === lowestPrice;

                return (
                  <td key={`price-${p.id}`} className="p-4 align-middle">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-[var(--theme-primary,#25D366)] font-mono">
                          ${effPrice.toFixed(2)}
                        </span>
                        {p.salePrice && (
                          <span className="text-xs text-[var(--theme-text-muted,#71717A)] line-through font-mono">
                            ${p.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {isBestPrice && products.length > 1 && (
                        <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                          Best Price
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Rating */}
            <tr>
              <td className="p-4 font-bold bg-[var(--theme-surface,#F4F4F5)]/50 text-[var(--theme-text,#18181B)]">
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
                    <span className="text-[11px] text-[var(--theme-text-muted,#71717A)]">({p.reviewCount})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Stock */}
            <tr>
              <td className="p-4 font-bold bg-[var(--theme-surface,#F4F4F5)]/50 text-[var(--theme-text,#18181B)]">
                Stock Status
              </td>
              {products.map((p) => {
                const inStock = p.stockStatus === "in_stock" && p.stockQuantity > 0;
                return (
                  <td key={`stock-${p.id}`} className="p-4 align-middle">
                    {inStock ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>In Stock</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <span>Out of Stock</span>
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Category */}
            <tr>
              <td className="p-4 font-bold bg-[var(--theme-surface,#F4F4F5)]/50 text-[var(--theme-text,#18181B)]">
                Category
              </td>
              {products.map((p) => (
                <td key={`cat-${p.id}`} className="p-4 align-middle font-medium">
                  {p.category || "General"}
                </td>
              ))}
            </tr>

            {/* Dynamic Specs */}
            {specKeys.map((key) => (
              <tr key={`spec-row-${key}`}>
                <td className="p-4 font-bold bg-[var(--theme-surface,#F4F4F5)]/50 text-[var(--theme-text,#18181B)]">
                  {key}
                </td>
                {products.map((p) => (
                  <td key={`spec-${key}-${p.id}`} className="p-4 align-middle">
                    {p.specifications[key] || "—"}
                  </td>
                ))}
              </tr>
            ))}

            {/* Short Description */}
            <tr>
              <td className="p-4 font-bold bg-[var(--theme-surface,#F4F4F5)]/50 text-[var(--theme-text,#18181B)]">
                Description
              </td>
              {products.map((p) => (
                <td key={`desc-${p.id}`} className="p-4 align-top text-[11px] leading-relaxed text-[var(--theme-text-muted,#71717A)]">
                  {p.shortDescription || "No summary available."}
                </td>
              ))}
            </tr>

            {/* Add to Cart */}
            <tr className="bg-[var(--theme-surface,#F4F4F5)]/30">
              <td className="p-4 font-bold text-[var(--theme-text,#18181B)]">
                Action
              </td>
              {products.map((p) => {
                const isOutOfStock = p.stockStatus === "out_of_stock" || p.stockQuantity <= 0;
                return (
                  <td key={`action-${p.id}`} className="p-4 align-middle">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      fullWidth
                      disabled={isOutOfStock || addingId === p.id}
                      onClick={() => handleAddToCart(p)}
                    >
                      {addingId === p.id ? "Adding..." : isOutOfStock ? "Sold Out" : "Add to Cart"}
                    </Button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--theme-border,#E4E4E7)] pb-3">
              <h2 className="text-base font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                Add Product to Compare
              </h2>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white px-4 py-2.5 text-xs text-[var(--theme-text,#18181B)] placeholder-zinc-400 focus:outline-none focus:border-[var(--theme-primary,#25D366)]"
              />
              {isSearching && (
                <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-[var(--theme-primary,#25D366)] border-r-transparent" />
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-[var(--theme-border,#E4E4E7)]">
              {searchResults.length === 0 && searchQuery && !isSearching && (
                <p className="text-center text-xs text-[var(--theme-text-muted,#71717A)] py-6">
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
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--theme-surface,#F4F4F5)]">
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
                        <p className="text-xs font-bold text-[var(--theme-text,#18181B)] line-clamp-1">
                          {p.name}
                        </p>
                        <p className="text-[11px] font-semibold text-[var(--theme-primary,#25D366)] font-mono">
                          ${Number(p.salePrice || p.price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={isSelected ? "outline" : "primary"}
                      size="sm"
                      disabled={isSelected}
                      onClick={() => {
                        addToCompare(p.id);
                        setIsSearchOpen(false);
                        const nextIds = [...activeIds, p.id];
                        router.replace(`/compare?ids=${nextIds.join(",")}`);
                      }}
                    >
                      {isSelected ? "Added" : "Select"}
                    </Button>
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
