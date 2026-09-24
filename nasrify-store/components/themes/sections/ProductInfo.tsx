"use client";

import React, { useState } from "react";
import { SectionProps } from "@/lib/themes/types";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useCompare } from "@/components/CompareContext";
import PriceTag from "../blocks/PriceTag";
import RatingStars from "../blocks/RatingStars";
import Button from "../blocks/Button";
import Badge from "../blocks/Badge";

import ProductOrderButton from "@/apps/whatsapp-order/storefront/ProductOrderButton";

export interface ProductInfoSettings {
  show_sku?: boolean;
  show_brand?: boolean;
  show_rating?: boolean;
  show_compare?: boolean;
  show_wishlist?: boolean;
  button_text?: string;
  button_style?: string;
}

export default function ProductInfo({
  variant = "standard",
  settings = {},
  storeData,
}: SectionProps<ProductInfoSettings>) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const product = storeData?.product || {
    id: "prod-sample-1",
    name: "Minimalist Ergonomic Workspace Chair",
    brand: "Nasrify Design",
    sku: "NAS-9921",
    price: 249.0,
    salePrice: 199.0,
    rating: 4.8,
    reviewsCount: 38,
    inStock: true,
    variants: [
      { id: "v1", name: "Matte Black" },
      { id: "v2", name: "Slate Grey" },
      { id: "v3", name: "Forest Green" },
    ],
    description:
      "Crafted with precision engineered lumbar support, breathable mesh, and anodized aluminum.",
  };

  const showSku = settings.show_sku !== false;
  const showBrand = settings.show_brand !== false;
  const showRating = settings.show_rating !== false;
  const showWishlist = settings.show_wishlist !== false;
  const showCompare = settings.show_compare !== false;
  const buttonText = settings.button_text || "Add to Cart";

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem(product.id, selectedVariant, quantity, {
        productName: product.name,
        productSlug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        imageUrl: product.imageUrl || (product.images && product.images[0]),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      await addItem(product.id, selectedVariant, quantity, {
        productName: product.name,
        productSlug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        imageUrl: product.imageUrl || (product.images && product.images[0]),
      });
      window.location.href = "/checkout";
    } catch (e) {
      console.error(e);
      setIsBuyingNow(false);
    }
  };

  const isFav = isInWishlist(product.id);
  const isCmp = isInCompare(product.id);

  return (
    <div className="w-full flex flex-col gap-4 font-[family-name:var(--theme-font-body)]">
      {/* Brand & SKU */}
      <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted,#71717A)]">
        {showBrand && product.brand && (
          <span className="font-semibold uppercase tracking-wider text-[var(--theme-primary,#25D366)]">
            {product.brand}
          </span>
        )}
        {showSku && product.sku && <span>SKU: {product.sku}</span>}
      </div>

      {/* Product Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)] tracking-tight">
        {product.name}
      </h1>

      {/* Rating & Stock */}
      <div className="flex items-center gap-3">
        {showRating && (
          <RatingStars
            rating={product.rating || 5}
            count={product.reviewsCount}
            showNumber
          />
        )}
        {product.inStock !== false ? (
          <Badge text="In Stock" variant="new" size="sm" />
        ) : (
          <Badge text="Out of Stock" variant="secondary" size="sm" />
        )}
      </div>

      {/* Price */}
      <div className="pt-2 pb-1 border-y border-[var(--theme-border,#E4E4E7)] my-1">
        <PriceTag
          price={product.price || 0}
          salePrice={product.salePrice}
          size="lg"
        />
      </div>

      {/* Short description */}
      {product.description && (
        <p className="text-sm text-[var(--theme-text-muted,#71717A)] leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text,#18181B)]">
            Option:{" "}
            <span className="font-normal text-[var(--theme-text-muted,#71717A)]">
              {product.variants.find((v: any) => v.id === selectedVariant)?.name ||
                "Select one"}
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v: any) => {
              const active = selectedVariant === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v.id)}
                  style={{
                    borderRadius: "var(--theme-button-radius, var(--theme-radius, 8px))",
                    borderColor: active
                      ? "var(--theme-primary, #25D366)"
                      : "var(--theme-border, #E4E4E7)",
                    backgroundColor: active
                      ? "var(--theme-primary-light, #DCFCE7)"
                      : "var(--theme-surface, #F4F4F5)",
                    color: active
                      ? "var(--theme-primary-dark, #1EA855)"
                      : "var(--theme-text, #18181B)",
                  }}
                  className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                    active ? "font-bold ring-1 ring-emerald-500/30" : ""
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & CTA */}
      <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity Controls */}
        <div
          style={{ borderRadius: "var(--theme-button-radius, var(--theme-radius, 8px))" }}
          className="flex items-center justify-between border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] h-11 px-3 w-full sm:w-32 shrink-0"
        >
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="text-lg font-semibold text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] px-2"
          >
            -
          </button>
          <span className="text-sm font-bold text-[var(--theme-text,#18181B)]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="text-lg font-semibold text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] px-2"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isAdding}
          onClick={handleAddToCart}
          className="h-11 shadow-md hover:shadow-lg"
        >
          {isAdding ? "Adding..." : buttonText}
        </Button>

        {/* Buy Now Button */}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          isLoading={isBuyingNow}
          onClick={handleBuyNow}
          className="h-11 !bg-[var(--theme-accent,#18181B)] !text-white hover:!bg-black"
        >
          {isBuyingNow ? "Preparing..." : "Buy Now"}
        </Button>
      </div>

      {/* WhatsApp Quick Order Button */}
      <div className="pt-1">
        <ProductOrderButton
          productId={product.id}
          productSlug={product.slug || product.id}
          productName={product.name}
          price={product.salePrice ?? product.price}
          quantity={quantity}
        />
      </div>

      {/* Wishlist & Compare actions */}
      {(showWishlist || showCompare) && (
        <div className="flex items-center gap-4 pt-2 text-xs font-medium">
          {showWishlist && (
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                isFav
                  ? "text-red-500 font-bold"
                  : "text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)]"
              }`}
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {isFav ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>
          )}

          {showCompare && (
            <button
              type="button"
              onClick={() => toggleCompare(product.id)}
              className={`inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                isCmp
                  ? "text-[var(--theme-primary,#25D366)] font-bold"
                  : "text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)]"
              }`}
            >
              <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {isCmp ? "In Compare List" : "Add to Compare"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
