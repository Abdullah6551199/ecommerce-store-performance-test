"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { ProductWithImagesAndCategory } from "@/lib/products";
import type { ProductVariantRecord } from "@/lib/variants";
import { normalizeImageUrl } from "@/lib/utils";

interface ProductShowcaseProps {
  product: ProductWithImagesAndCategory;
}

export default function ProductShowcase({ product }: ProductShowcaseProps): React.JSX.Element {
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  // Find initial default variant or first variant
  const defaultVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find((v) => v.isDefault) || variants[0] || null;
  }, [variants, hasVariants]);

  // Extract distinct attribute options (e.g. { Color: ["Black", "White"], Size: ["S", "M", "L"] })
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

  // Selected options state (e.g. { Color: "Black", Size: "M" })
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (defaultVariant && defaultVariant.options) {
      return { ...defaultVariant.options };
    }
    const initial: Record<string, string> = {};
    Object.entries(optionAttributes).forEach(([k, vals]) => {
      if (vals.length > 0) initial[k] = vals[0];
    });
    return initial;
  });

  // Determine active matching variant based on current selections
  const activeVariant: ProductVariantRecord | null = useMemo(() => {
    if (!hasVariants) return null;
    const match = variants.find((v) => {
      if (!v.options) return false;
      const keys = Object.keys(selectedOptions);
      return (
        keys.length === Object.keys(v.options).length &&
        keys.every((k) => v.options[k] === selectedOptions[k])
      );
    });
    return match || defaultVariant;
  }, [variants, hasVariants, selectedOptions, defaultVariant]);

  // All image URLs for gallery
  const allImageUrls = useMemo(() => {
    const urls: string[] = [];
    if (product.mainImage) {
      const norm = normalizeImageUrl(product.mainImage);
      if (norm) urls.push(norm);
    }
    product.images?.forEach((img) => {
      const norm = normalizeImageUrl(img.imageUrl);
      if (norm && !urls.includes(norm)) {
        urls.push(norm);
      }
    });
    // Also include variant images if distinct
    variants.forEach((v) => {
      if (v.imageUrl) {
        const norm = normalizeImageUrl(v.imageUrl);
        if (norm && !urls.includes(norm)) {
          urls.push(norm);
        }
      }
    });
    return urls;
  }, [product.mainImage, product.images, variants]);

  // Active Featured Image Viewer
  const [activeImage, setActiveImage] = useState<string>(() => {
    const initialVariantImg = activeVariant?.imageUrl ? normalizeImageUrl(activeVariant.imageUrl) : "";
    return initialVariantImg || allImageUrls[0] || "";
  });

  // When active variant changes and has an image, switch featured image
  useEffect(() => {
    if (activeVariant?.imageUrl) {
      setActiveImage(normalizeImageUrl(activeVariant.imageUrl));
    }
  }, [activeVariant]);

  // Cart quantity & feedback state
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [cartPayloadSummary, setCartPayloadSummary] = useState<string | null>(null);

  // Price calculations
  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentSalePrice = activeVariant
    ? activeVariant.salePrice
    : product.salePrice;

  const hasSale = Boolean(currentSalePrice && currentSalePrice < currentPrice);
  const savings = hasSale ? (currentPrice - Number(currentSalePrice)).toFixed(2) : null;
  const discountPercent = hasSale
    ? Math.round(((currentPrice - Number(currentSalePrice)) / currentPrice) * 100)
    : 0;

  // Stock calculations
  const isOutOfStock = hasVariants
    ? !activeVariant || activeVariant.stock <= 0
    : product.stockStatus === "out_of_stock" ||
      (product.trackInventory && product.stockQuantity <= 0 && !product.allowBackorders);

  const isLowStock = hasVariants
    ? Boolean(activeVariant && activeVariant.stock > 0 && activeVariant.stock <= 5)
    : !isOutOfStock &&
      product.trackInventory &&
      product.stockQuantity <= product.lowStockThreshold;

  const remainingStock = activeVariant
    ? activeVariant.stock
    : product.stockQuantity;

  // Current displayed SKU
  const displayedSku = activeVariant ? activeVariant.sku : product.sku;

  // Option selection handler
  const handleSelectOption = (attrKey: string, val: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attrKey]: val,
    }));
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const payload = {
      productId: product.id,
      variantId: activeVariant?.id || undefined,
      quantity,
      unitPrice: currentSalePrice || currentPrice,
      selectedOptions: activeVariant?.options || undefined,
      sku: displayedSku,
    };

    console.log("[Storefront] Add to Cart payload dispatched:", payload);

    setCartPayloadSummary(
      activeVariant
        ? `${product.name} (${Object.values(activeVariant.options).join(", ")}) [Variant: ${activeVariant.id.slice(0, 8)}]`
        : product.name
    );

    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      setCartPayloadSummary(null);
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Gallery Column (7 cols on lg) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Active Featured Image Viewer */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/15 bg-black/50 shadow-2xl group">
          {activeImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="aspect-square w-full flex flex-col items-center justify-center p-8 text-center text-white/30">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="mt-3 text-xs font-mono">No Product Images</span>
            </div>
          )}

          {/* Active Variant Tag Overlay */}
          {activeVariant && activeVariant.imageUrl === activeImage && (
            <div className="absolute top-4 left-4 rounded-xl bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-[#18C729] border border-[#18C729]/30">
              {Object.values(activeVariant.options).join(" / ")} Photo
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Gallery Thumbnail Strip */}
        {allImageUrls.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {allImageUrls.map((url, idx) => {
              const isCurrent = url === activeImage;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition-all ${
                    isCurrent
                      ? "border-[#18C729] ring-2 ring-[#18C729]/30 scale-105"
                      : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Details & Purchase Column (5 cols on lg) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2">
          {product.brand && (
            <span className="text-xs font-bold uppercase tracking-wider text-[#FEF500]">
              {product.brand}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {product.name}
          </h1>

          {/* SKU and Stock Pill Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-mono text-white/70 border border-white/10">
              SKU: {displayedSku}
            </span>

            {hasVariants && (
              <span className="rounded-lg bg-[#FEF500]/10 px-2.5 py-1 text-[11px] font-semibold text-[#FEF500] border border-[#FEF500]/20">
                {variants.length} Options Available
              </span>
            )}

            {isOutOfStock ? (
              <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/30">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="rounded-full bg-[#FEF500]/10 px-2.5 py-0.5 text-xs font-semibold text-[#FEF500] border border-[#FEF500]/30">
                Low Stock ({remainingStock} remaining)
              </span>
            ) : (
              <span className="rounded-full bg-[#18C729]/10 px-2.5 py-0.5 text-xs font-semibold text-[#18C729] border border-[#18C729]/30">
                In Stock ({remainingStock} units)
              </span>
            )}
          </div>
        </div>

        {/* Pricing Display */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
          <div className="flex items-baseline gap-3">
            {hasSale ? (
              <>
                <span className="text-3xl font-extrabold text-[#18C729]">
                  ${Number(currentSalePrice).toFixed(2)}
                </span>
                <span className="text-base text-white/40 line-through">
                  ${Number(currentPrice).toFixed(2)}
                </span>
                <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400 border border-red-500/30">
                  Save ${savings} ({discountPercent}%)
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl font-extrabold text-white">
                  ${Number(currentPrice).toFixed(2)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <span className="text-sm text-white/40 line-through">
                    MSRP ${Number(product.compareAtPrice).toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-[11px] text-white/50">
            Taxes calculated at checkout. Real-time Cloudflare D1 inventory.
          </p>
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-white/70 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* VARIANT SELECTORS */}
        {hasVariants && (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Select Options
              </span>
              {activeVariant && (
                <span className="text-xs text-[#18C729] font-mono">
                  {activeVariant.sku}
                </span>
              )}
            </div>

            {Object.entries(optionAttributes).map(([attrName, optionValues]) => {
              const currentVal = selectedOptions[attrName];

              return (
                <div key={attrName} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/80">{attrName}</span>
                    <span className="text-white/50 font-medium">{currentVal}</span>
                  </div>

                  {/* Option Pill Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {optionValues.map((val) => {
                      const isSelected = currentVal === val;

                      // Check if selecting this option leads to an out-of-stock combination
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
                          onClick={() => handleSelectOption(attrName, val)}
                          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? "border-[#18C729] bg-[#18C729]/15 text-white shadow-md shadow-[#18C729]/20 scale-105"
                              : isComboOutOfStock
                              ? "border-white/10 bg-white/[0.02] text-white/30 hover:border-white/20"
                              : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {val}
                            {isComboOutOfStock && (
                              <span className="text-[9px] text-red-400 font-normal">
                                (Out)
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD TO CART & QUANTITY SECTION */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-1">
              <button
                type="button"
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-bold text-white">
                {quantity}
              </span>
              <button
                type="button"
                disabled={isOutOfStock || quantity >= remainingStock}
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-8 text-sm font-bold transition-all shadow-xl ${
                isOutOfStock
                  ? "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
                  : addedNotice
                  ? "bg-[#18C729] text-black shadow-[#18C729]/30 scale-[1.02]"
                  : "bg-gradient-to-r from-[#18C729] to-[#12a822] text-black shadow-[#18C729]/25 hover:brightness-110 active:scale-[0.98]"
              }`}
            >
              {addedNotice ? (
                <>
                  <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Added to Cart ({quantity})</span>
                </>
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
          </div>

          {/* Cart Payload Confirmation Pill */}
          {cartPayloadSummary && (
            <div className="rounded-xl border border-[#18C729]/30 bg-[#18C729]/10 p-2.5 text-xs text-[#18C729] flex items-center gap-2 animate-fade-in">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="truncate">Ready for Stage 9 Checkout: {cartPayloadSummary}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
            <span>
              {activeVariant ? `Variant: ${activeVariant.sku} • ` : ""}
              Cloudflare Workers Edge Delivery
            </span>
          </div>
        </div>

        {/* Catalog Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-2">
              Catalog Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:border-[#18C729]/50 hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
