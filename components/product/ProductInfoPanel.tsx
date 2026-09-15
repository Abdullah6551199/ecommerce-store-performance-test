"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import CompareButton from "@/components/CompareButton";
import TrustBadges from "@/components/TrustBadges";
import type { ProductVariantRecord } from "@/lib/variants";

// Standard color names mapped to CSS hex for swatches
const COLOR_HEX_MAP: Record<string, string> = {
  black: "#111827",
  white: "#F9FAFB",
  silver: "#D1D5DB",
  gray: "#6B7280",
  grey: "#6B7280",
  charcoal: "#374151",
  red: "#EF4444",
  crimson: "#DC2626",
  blue: "#3B82F6",
  navy: "#1E3A8A",
  purple: "#960DF2",
  lavender: "#EACFFC",
  violet: "#780AC2",
  green: "#10B981",
  olive: "#556B2F",
  gold: "#F59E0B",
  yellow: "#FBBF24",
  orange: "#F97316",
  pink: "#EC4899",
  rose: "#F43F5E",
  brown: "#78350F",
  tan: "#D2B48C",
  beige: "#F5F5DC",
};

interface ProductInfoPanelProps {
  productId: string;
  productName: string;
  brand: string | null;
  basePrice: number;
  baseSalePrice: number | null;
  compareAtPrice: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "backorder" | "preorder";
  stockQuantity: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  lowStockThreshold: number;
  baseSku: string;
  shortDescription?: string | null;
  averageRating?: number;
  reviewCount?: number;
  variants?: ProductVariantRecord[];
  onSelectVariantImage?: (imageUrl: string | null) => void;
  onReviewsClick?: () => void;
}

export default function ProductInfoPanel({
  productId,
  productName,
  brand,
  basePrice,
  baseSalePrice,
  compareAtPrice,
  stockStatus,
  stockQuantity,
  trackInventory,
  allowBackorders,
  lowStockThreshold,
  baseSku,
  shortDescription,
  averageRating = 4.8,
  reviewCount = 24,
  variants = [],
  onSelectVariantImage,
  onReviewsClick,
}: ProductInfoPanelProps): React.JSX.Element {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Social proof simulated viewer count (consistent per product id hash)
  const viewerCount = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = (hash * 31 + productId.charCodeAt(i)) % 30;
    }
    return 15 + Math.abs(hash);
  }, [productId]);

  const hasVariants = variants.length > 0;

  // Extract distinct attribute options (e.g. Color, Size)
  const optionAttributes = useMemo(() => {
    if (!hasVariants) return {};
    const attrs: Record<string, string[]> = {};
    variants.forEach((v) => {
      if (v.options) {
        Object.entries(v.options).forEach(([attrKey, val]) => {
          if (!attrs[attrKey]) attrs[attrKey] = [];
          if (!attrs[attrKey].includes(val)) {
            attrs[attrKey].push(val);
          }
        });
      }
    });
    return attrs;
  }, [variants, hasVariants]);

  // Selected options state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaultVariant = variants.find((v) => v.isDefault) || variants[0] || null;
    if (defaultVariant && defaultVariant.options) {
      return { ...defaultVariant.options };
    }
    const initial: Record<string, string> = {};
    Object.entries(optionAttributes).forEach(([k, vals]) => {
      if (vals.length > 0) initial[k] = vals[0];
    });
    return initial;
  });

  // Determine active matching variant
  const activeVariant = useMemo(() => {
    if (!hasVariants) return null;
    const match = variants.find((v) => {
      if (!v.options) return false;
      const keys = Object.keys(selectedOptions);
      return (
        keys.length === Object.keys(v.options).length &&
        keys.every((k) => v.options[k] === selectedOptions[k])
      );
    });
    return match || variants[0] || null;
  }, [variants, hasVariants, selectedOptions]);

  // Pricing calculations
  const currentPrice = activeVariant ? activeVariant.price : basePrice;
  const currentSalePrice = activeVariant ? activeVariant.salePrice : baseSalePrice;
  const hasSale = Boolean(currentSalePrice && currentSalePrice < currentPrice);
  const effectivePrice = hasSale ? Number(currentSalePrice) : Number(currentPrice);
  const strikethroughPrice = hasSale
    ? Number(currentPrice)
    : compareAtPrice && compareAtPrice > currentPrice
    ? Number(compareAtPrice)
    : null;
  const savingsAmount = strikethroughPrice && strikethroughPrice > effectivePrice
    ? (strikethroughPrice - effectivePrice).toFixed(2)
    : null;
  const discountPercent = strikethroughPrice && strikethroughPrice > effectivePrice
    ? Math.round(((strikethroughPrice - effectivePrice) / strikethroughPrice) * 100)
    : 0;

  // Stock calculations
  const isOutOfStock = hasVariants
    ? !activeVariant || activeVariant.stock <= 0
    : stockStatus === "out_of_stock" ||
      (trackInventory && stockQuantity <= 0 && !allowBackorders);

  const remainingStock = activeVariant ? activeVariant.stock : stockQuantity;
  const isLowStock = !isOutOfStock && (
    hasVariants
      ? Boolean(activeVariant && activeVariant.stock > 0 && activeVariant.stock <= 5)
      : trackInventory && stockQuantity <= (lowStockThreshold || 5)
  );

  const handleSelectOption = (attrKey: string, val: string) => {
    const nextOptions = { ...selectedOptions, [attrKey]: val };
    setSelectedOptions(nextOptions);

    // If variant has photo, notify gallery
    if (hasVariants) {
      const match = variants.find((v) => {
        if (!v.options) return false;
        const keys = Object.keys(nextOptions);
        return (
          keys.length === Object.keys(v.options).length &&
          keys.every((k) => v.options[k] === nextOptions[k])
        );
      });
      if (match?.imageUrl && onSelectVariantImage) {
        onSelectVariantImage(match.imageUrl);
      }
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(productId, activeVariant?.id || null, quantity, {
        productName,
        price: Number(currentPrice),
        salePrice: hasSale ? Number(currentSalePrice) : null,
        stockQuantity: remainingStock,
        variantOptions: activeVariant?.options || null,
        openOnSuccess: true,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock || isBuyingNow) return;
    setIsBuyingNow(true);
    try {
      await addItem(productId, activeVariant?.id || null, quantity, {
        productName,
        price: Number(currentPrice),
        salePrice: hasSale ? Number(currentSalePrice) : null,
        stockQuantity: remainingStock,
        variantOptions: activeVariant?.options || null,
        openOnSuccess: false,
      });
      router.push("/checkout");
    } catch {
      setIsBuyingNow(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} on Apex Store`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const handleScrollToReviews = () => {
    if (onReviewsClick) {
      onReviewsClick();
    } else {
      const el = document.getElementById("product-tabs") || document.getElementById("customer-reviews");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-5 lg:sticky lg:top-28 text-left">
      {/* 1. Rating Summary Header */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1 text-amber-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="text-base">
              {star <= Math.round(averageRating) ? "★" : "☆"}
            </span>
          ))}
        </div>
        <span className="font-extrabold text-sm text-purple-600 dark:text-purple-300">
          {Number(averageRating).toFixed(1)}
        </span>
        <span className="text-zinc-300 dark:text-purple-800">•</span>
        <button
          type="button"
          onClick={handleScrollToReviews}
          className="text-xs font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 hover:underline cursor-pointer"
        >
          ({reviewCount} reviews)
        </button>
        {brand && (
          <span className="ml-auto inline-block rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/60 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:text-[#EACFFC] uppercase tracking-wider">
            {brand}
          </span>
        )}
      </div>

      {/* 2. Product Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#3C0561] dark:text-[#EACFFC] leading-tight">
        {productName}
      </h1>

      {/* 3. Price Block */}
      <div className="flex flex-wrap items-baseline gap-2 pt-1 border-b border-purple-100 dark:border-purple-800/40 pb-4">
        <span className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-300">
          ${effectivePrice.toFixed(2)}
        </span>

        {strikethroughPrice && strikethroughPrice > effectivePrice && (
          <span className="text-lg sm:text-xl text-purple-400 dark:text-purple-200/60 line-through font-mono">
            ${strikethroughPrice.toFixed(2)}
          </span>
        )}

        {discountPercent > 0 && (
          <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 px-2.5 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-700">
            Save ${savingsAmount} ({discountPercent}%)
          </span>
        )}
      </div>

      {/* 4. Short Description */}
      {shortDescription && (
        <p className="text-sm text-purple-700 dark:text-purple-200 line-clamp-3 leading-relaxed">
          {shortDescription}
        </p>
      )}

      {/* 5. Trust Badges Row */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/50 text-xs text-purple-600 dark:text-purple-200">
        <div className="flex items-center gap-2">
          <span className="text-base">🚚</span>
          <span className="font-semibold leading-tight">Free Shipping</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">↩️</span>
          <span className="font-semibold leading-tight">30-Day Returns</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">🛡️</span>
          <span className="font-semibold leading-tight">1-Yr Warranty</span>
        </div>
      </div>

      {/* 6. Variant Selectors */}
      {hasVariants && (
        <div className="space-y-4 pt-1">
          {Object.entries(optionAttributes).map(([attrName, optionValues]) => {
            const currentVal = selectedOptions[attrName];
            const isColor = attrName.toLowerCase().includes("color");

            return (
              <div key={attrName} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#3C0561] dark:text-[#EACFFC]">
                    {attrName}: <span className="font-bold text-purple-600 dark:text-purple-300">{currentVal}</span>
                  </span>
                  {activeVariant && isColor && (
                    <span className="text-[11px] font-mono text-purple-400">SKU: {activeVariant.sku}</span>
                  )}
                </div>

                {isColor ? (
                  /* Color Circle Swatches */
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {optionValues.map((val) => {
                      const isSelected = currentVal === val;
                      const hexColor = COLOR_HEX_MAP[val.toLowerCase()] || "#960DF2";

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectOption(attrName, val)}
                          className={`group relative h-9 w-9 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? "ring-2 ring-purple-400 ring-offset-2 dark:ring-offset-[#3C0561] scale-110 shadow-md"
                              : "hover:scale-105 opacity-85 hover:opacity-100"
                          }`}
                          title={`Color: ${val}`}
                          aria-label={`Select color ${val}`}
                        >
                          <span
                            className="h-7 w-7 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: hexColor }}
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Size / Other Button Pills */
                  <div className="flex flex-wrap gap-2">
                    {optionValues.map((val) => {
                      const isSelected = currentVal === val;
                      const testCombo = { ...selectedOptions, [attrName]: val };
                      const testVariant = variants.find((v) =>
                        v.options &&
                        Object.keys(testCombo).every((k) => v.options[k] === testCombo[k])
                      );
                      const isComboOutOfStock = testVariant ? testVariant.stock <= 0 : false;

                      return (
                        <button
                          key={val}
                          type="button"
                          disabled={isComboOutOfStock}
                          onClick={() => handleSelectOption(attrName, val)}
                          className={`min-h-[42px] min-w-[48px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-400 text-white border-purple-400 shadow-md shadow-purple-500/25 scale-105"
                              : isComboOutOfStock
                              ? "opacity-40 cursor-not-allowed line-through bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-white/30"
                              : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700 hover:border-purple-400 hover:bg-purple-100"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Quantity Selector */}
      <div className="flex items-center gap-3 pt-2">
        <span className="text-xs font-bold text-[#3C0561] dark:text-[#EACFFC]">Quantity:</span>
        <div className="flex items-center rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/50 p-1">
          <button
            type="button"
            disabled={quantity <= 1 || isOutOfStock}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-purple-700 dark:text-purple-200 hover:bg-purple-200/50 dark:hover:bg-purple-800/50 disabled:opacity-30 transition cursor-pointer font-bold"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-10 text-center text-sm font-bold text-[#3C0561] dark:text-white">
            {quantity}
          </span>
          <button
            type="button"
            disabled={isOutOfStock || quantity >= remainingStock}
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-purple-700 dark:text-purple-200 hover:bg-purple-200/50 dark:hover:bg-purple-800/50 disabled:opacity-30 transition cursor-pointer font-bold"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="text-xs text-purple-400 font-mono">
          {remainingStock > 0 ? `(${remainingStock} available)` : "Out of stock"}
        </span>
      </div>

      {/* 8. Add to Cart & Buy Now Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className="w-full inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl text-lg font-bold text-white bg-purple-400 hover:bg-purple-500 active:scale-[0.98] shadow-lg shadow-purple-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isAdding ? (
            <span>Adding to Cart...</span>
          ) : isOutOfStock ? (
            <span>Sold Out</span>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock || isBuyingNow}
          className="w-full inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl text-lg font-bold text-white bg-[#3C0561] hover:bg-[#5A0891] active:scale-[0.98] shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isBuyingNow ? <span>Preparing Checkout...</span> : <span>Buy Now</span>}
        </button>
      </div>

      {/* Trust Badges Row (Stage 22 Part A: 4 badges under Add to Cart) */}
      <div className="pt-2">
        <TrustBadges location="product" limit={4} />
      </div>

      {/* 9. Wishlist, Compare & Share Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-100 dark:border-purple-800/40">
        <button
          type="button"
          onClick={() =>
            toggleWishlist({
              productId,
              slug: baseSku || productId,
              name: productName,
              price: Number(currentPrice),
              salePrice: currentSalePrice ? Number(currentSalePrice) : null,
            })
          }
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
            inWishlist
              ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
              : "border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-200 hover:border-purple-400"
          }`}
        >
          <svg
            className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : "fill-none"}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{inWishlist ? "Saved" : "Wishlist"}</span>
        </button>

        <CompareButton productId={productId} variant="pill" />

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-200 hover:border-purple-400 transition-all cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{shareSuccess ? "Link Copied!" : "Share"}</span>
        </button>
      </div>

      {/* 10. Social Proof & Urgency */}
      <div className="space-y-1.5 pt-1 text-xs text-purple-600 dark:text-purple-200">
        <div className="flex items-center gap-2">
          <span>🔥</span>
          <span className="font-semibold">{viewerCount} people viewing this right now</span>
        </div>
        {isLowStock && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold animate-pulse">
            <span>⚠️</span>
            <span>Only {remainingStock} left in stock - order soon!</span>
          </div>
        )}
      </div>
    </div>
  );
}
