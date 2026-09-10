"use client";

import React, { useState, useMemo } from "react";
import { useCart } from "@/components/CartContext";
import type { ProductVariantRecord } from "@/lib/variants";

interface ProductPurchaseSectionProps {
  productId: string;
  productName: string;
  basePrice: number;
  baseSalePrice: number | null;
  compareAtPrice: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "backorder" | "preorder";
  stockQuantity: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  lowStockThreshold: number;
  baseSku: string;
  variants?: ProductVariantRecord[];
}

/**
 * Isolated Client Island for Product Variants, Pricing & Add-to-Cart.
 * Allows interactive option selection, quantity adjustments, and cart dispatch
 * while the rest of the product detail page remains server-rendered.
 */
export default function ProductPurchaseSection({
  productId,
  productName,
  basePrice,
  baseSalePrice,
  compareAtPrice,
  stockStatus,
  stockQuantity,
  trackInventory,
  allowBackorders,
  lowStockThreshold,
  baseSku,
  variants = [],
}: ProductPurchaseSectionProps): React.JSX.Element {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [cartPayloadSummary, setCartPayloadSummary] = useState<string | null>(null);

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

  // Selected options state
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

  // Determine active matching variant
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

  // Price calculations
  const currentPrice = activeVariant ? activeVariant.price : basePrice;
  const currentSalePrice = activeVariant ? activeVariant.salePrice : baseSalePrice;
  const hasSale = Boolean(currentSalePrice && currentSalePrice < currentPrice);
  const savings = hasSale ? (currentPrice - Number(currentSalePrice)).toFixed(2) : null;
  const discountPercent = hasSale
    ? Math.round(((currentPrice - Number(currentSalePrice)) / currentPrice) * 100)
    : 0;

  // Stock calculations
  const isOutOfStock = hasVariants
    ? !activeVariant || activeVariant.stock <= 0
    : stockStatus === "out_of_stock" ||
      (trackInventory && stockQuantity <= 0 && !allowBackorders);

  const isLowStock = hasVariants
    ? Boolean(activeVariant && activeVariant.stock > 0 && activeVariant.stock <= 5)
    : !isOutOfStock && trackInventory && stockQuantity <= lowStockThreshold;

  const remainingStock = activeVariant ? activeVariant.stock : stockQuantity;
  const displayedSku = activeVariant ? activeVariant.sku : baseSku;

  const handleSelectOption = (attrKey: string, val: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attrKey]: val,
    }));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    setCartPayloadSummary(
      activeVariant
        ? `${productName} (${Object.values(activeVariant.options).join(", ")})`
        : productName
    );
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      setCartPayloadSummary(null);
    }, 2500);

    void addItem(productId, activeVariant?.id || null, quantity, {
      productName,
      price: hasSale ? Number(currentSalePrice) : Number(currentPrice),
      variantOptions: activeVariant?.options || null,
      openOnSuccess: true,
    });
  };

  return (
    <div className="space-y-6">
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
              {compareAtPrice && compareAtPrice > currentPrice && (
                <span className="text-sm text-white/40 line-through">
                  MSRP ${Number(compareAtPrice).toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>
        <p className="text-[11px] text-white/50">
          Taxes calculated at checkout. Real-time Cloudflare D1 inventory.
        </p>
      </div>

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
                        onClick={() => handleSelectOption(attrName, val)}
                        className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
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
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
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
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
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
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-8 text-sm font-bold transition-all shadow-xl cursor-pointer ${
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
            <span className="truncate">Added to Cart: {cartPayloadSummary}</span>
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
    </div>
  );
}
