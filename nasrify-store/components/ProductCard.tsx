import React from "react";
import Image from "next/image";
import Link from "next/link";
import QuickAddToCart from "./QuickAddToCart";
import { normalizeImageUrl } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  isPriority?: boolean;
}

export default function ProductCard({
  product,
  isPriority = false,
}: ProductCardProps): React.JSX.Element {
  const hasSale = Boolean(
    product.salePrice &&
      product.salePrice > 0 &&
      product.salePrice < product.price
  );

  const discountPercent = hasSale
    ? Math.round(
        ((product.price - (product.salePrice || 0)) / product.price) * 100
      )
    : 0;

  const isOutOfStock =
    product.trackInventory && product.stockQuantity <= 0;

  const isLowStock =
    !isOutOfStock && product.trackInventory && product.stockQuantity <= product.lowStockThreshold;

  const resolvedImage = normalizeImageUrl(product.mainImage, { width: 640, quality: 75 });
  const hasVariants = Boolean(product.variants && product.variants.length > 1);
  const defaultVariantId = product.variants?.[0]?.id || null;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white p-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-[var(--theme-primary,#25D366)] hover:shadow-lg text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-body)]">
      {/* 1. Image Container (1:1 Square) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--theme-surface,#F4F4F5)]">
        <Link
          href={`/product/${product.slug}`}
          prefetch={false}
          className="relative block h-full w-full"
        >
          {resolvedImage ? (
            <Image
              src={resolvedImage}
              alt={product.name}
              fill
              priority={isPriority}
              {...(isPriority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--theme-surface,#F4F4F5)] text-center p-4">
              <svg className="h-8 w-8 text-[var(--theme-text-muted,#71717A)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="mt-1 text-[10px] text-[var(--theme-text-muted,#71717A)]">No Image</span>
            </div>
          )}
        </Link>

        {/* Top Badges (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {hasSale && (
            <span className="rounded-full bg-[var(--theme-primary,#25D366)] text-white px-2 py-0.5 text-[10px] font-bold shadow-md tracking-wider">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock ? (
            <span className="rounded-full bg-rose-600 text-white px-2 py-0.5 text-[9px] font-semibold">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[9px] font-semibold">
              Only {product.stockQuantity} left
            </span>
          ) : null}
        </div>

        {/* Floating Quick Add Overlay (Desktop Hover) */}
        <div className="hidden sm:block absolute inset-x-2 bottom-2 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <QuickAddToCart
            productId={product.id}
            productSlug={product.slug}
            isOutOfStock={isOutOfStock}
            defaultVariantId={defaultVariantId}
            hasMultipleVariants={hasVariants}
            productName={product.name}
            price={hasSale ? Number(product.salePrice) : Number(product.price)}
            imageUrl={resolvedImage}
            stockQuantity={product.stockQuantity ?? (isOutOfStock ? 0 : 99)}
          />
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="mt-3 flex flex-1 flex-col justify-between space-y-2">
        <div>
          {/* Star Rating and Reviews */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-400">
              {"★".repeat(5)}
            </div>
            <span className="font-semibold text-[var(--theme-text,#18181B)] text-[11px]">
              {product.averageRating ? Number(product.averageRating).toFixed(1) : "4.9"}
            </span>
            <span className="text-[var(--theme-text-muted,#71717A)] text-[10px]">
              ({product.reviewCount !== undefined && product.reviewCount !== null ? product.reviewCount : 12})
            </span>
          </div>

          {/* Product Title (Truncated to 2 lines) */}
          <h3 className="mt-1 text-xs sm:text-sm font-bold text-[var(--theme-text,#18181B)] group-hover:text-[var(--theme-primary,#25D366)] transition-colors line-clamp-2 leading-snug font-[family-name:var(--theme-font-heading)]">
            <Link href={`/product/${product.slug}`} prefetch={false}>
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Price Row */}
        <div className="pt-2 border-t border-[var(--theme-border,#E4E4E7)] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {hasSale ? (
              <>
                <span className="text-sm sm:text-base font-extrabold text-[var(--theme-primary,#25D366)]">
                  ${Number(product.salePrice).toFixed(2)}
                </span>
                <span className="text-xs text-[var(--theme-text-muted,#71717A)] line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-[var(--theme-text,#18181B)]">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Mobile Fallback Add button */}
          <div className="sm:hidden">
            <QuickAddToCart
              productId={product.id}
              productSlug={product.slug}
              isOutOfStock={isOutOfStock}
              defaultVariantId={defaultVariantId}
              hasMultipleVariants={hasVariants}
              productName={product.name}
              price={hasSale ? Number(product.salePrice) : Number(product.price)}
              imageUrl={resolvedImage}
              stockQuantity={product.stockQuantity ?? (isOutOfStock ? 0 : 99)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
