"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import PriceTag from "./PriceTag";
import RatingStars from "./RatingStars";
import Badge from "./Badge";
import Button from "./Button";

export interface ProductCardProps {
  product: any;
  showPrice?: boolean;
  showRating?: boolean;
  showAddToCart?: boolean;
  variant?: "standard" | "compact" | "minimal" | "hover_details";
  className?: string;
}

export default function ProductCard({
  product,
  showPrice = true,
  showRating = true,
  showAddToCart = true,
  variant = "standard",
  className = "",
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const currentPrice = product.salePrice ?? product.price ?? 0;
  const originalPrice = product.price ?? 0;
  const isOnSale = product.salePrice && product.salePrice < originalPrice;
  const imageUrl = product.imageUrl || product.mainImage || "/placeholder.png";
  const rating = product.rating || product.averageRating || 5;
  const reviewsCount = product.reviewsCount || product.reviewCount;
  const productUrl = `/product/${product.slug || product.id}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem(product.id, null, 1, {
        productName: product.name,
        productSlug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        imageUrl,
      });
    } catch (err) {
      console.error("Failed to add item to cart:", err);
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  if (variant === "minimal") {
    return (
      <div
        className={`group relative flex flex-col bg-transparent ${className}`}
      >
        <Link
          href={productUrl}
          className="relative aspect-square w-full overflow-hidden rounded-[var(--theme-radius,8px)] bg-[var(--theme-surface,#F4F4F5)]"
        >
          <Image
            src={imageUrl}
            alt={product.name || "Product"}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          {isOnSale && (
            <div className="absolute top-2 left-2">
              <Badge text="Sale" variant="sale" size="sm" />
            </div>
          )}
        </Link>
        <div className="mt-2.5 flex flex-col">
          <Link
            href={productUrl}
            className="text-xs sm:text-sm font-medium text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] line-clamp-1"
          >
            {product.name}
          </Link>
          {showPrice && (
            <div className="mt-1">
              <PriceTag price={originalPrice} salePrice={product.salePrice} size="sm" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        style={{ borderRadius: "var(--theme-radius, 8px)" }}
        className={`group relative flex flex-row items-center gap-3 p-2.5 border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] hover:shadow-sm transition-all ${className}`}
      >
        <Link
          href={productUrl}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--theme-radius,8px)] bg-[var(--theme-surface,#F4F4F5)]"
        >
          <Image
            src={imageUrl}
            alt={product.name || "Product"}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform"
          />
        </Link>
        <div className="flex flex-col flex-1 min-w-0">
          <Link
            href={productUrl}
            className="text-xs font-semibold text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] truncate"
          >
            {product.name}
          </Link>
          {showPrice && (
            <PriceTag price={originalPrice} salePrice={product.salePrice} size="sm" className="mt-0.5" />
          )}
        </div>
        {showAddToCart && (
          <Button
            size="sm"
            variant="outline"
            isLoading={isAdding}
            onClick={handleAddToCart}
            className="shrink-0 !px-2.5 !py-1 text-xs"
          >
            Add
          </Button>
        )}
      </div>
    );
  }

  // Standard variant
  return (
    <div
      style={{ borderRadius: "var(--theme-radius, 8px)" }}
      className={`group relative flex flex-col border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 ${className}`}
    >
      {/* Product Image */}
      <Link
        href={productUrl}
        className="relative aspect-square w-full overflow-hidden bg-[var(--theme-surface,#F4F4F5)]"
      >
        <Image
          src={imageUrl}
          alt={product.name || "Product"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isOnSale && <Badge text="Sale" variant="sale" size="sm" />}
          {product.isNew && <Badge text="New" variant="new" size="sm" />}
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {showRating && (
          <div className="mb-1.5">
            <RatingStars rating={rating} count={reviewsCount} size="sm" />
          </div>
        )}

        <Link
          href={productUrl}
          className="text-sm font-semibold text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] line-clamp-2 transition-colors"
        >
          {product.name}
        </Link>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          {showPrice && (
            <PriceTag price={originalPrice} salePrice={product.salePrice} size="md" />
          )}
        </div>

        {showAddToCart && (
          <div className="mt-3.5 pt-2">
            <Button
              fullWidth
              size="sm"
              variant="primary"
              isLoading={isAdding}
              onClick={handleAddToCart}
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
