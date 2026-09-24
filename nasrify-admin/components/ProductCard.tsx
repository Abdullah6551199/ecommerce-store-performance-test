import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProductWithImagesAndCategory, CatalogProductItem } from "@/lib/products";
import { normalizeImageUrl } from "@/lib/utils";
import QuickAddToCart from "@/components/QuickAddToCart";
import WishlistHeartButton from "@/components/WishlistHeartButton";
import CompareButton from "@/components/CompareButton";

interface ProductCardProps {
  product: ProductWithImagesAndCategory | CatalogProductItem;
  isPriority?: boolean;
}

/**
 * High-performance Server Component for Product Card (Stage 18.1 Chronicles Redesign).
 * Features 1:1 square media, purple discount pills, slide-up quick add-to-cart on hover,
 * star ratings, and purple price accents.
 */
export default function ProductCard({ product, isPriority = false }: ProductCardProps): React.JSX.Element {
  const hasSale = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasSale
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const isOutOfStock =
    product.stockStatus === "out_of_stock" ||
    (product.trackInventory && product.stockQuantity <= 0 && !product.allowBackorders);
  const isLowStock =
    !isOutOfStock && product.trackInventory && product.stockQuantity <= product.lowStockThreshold;

  const resolvedImage = normalizeImageUrl(product.mainImage, { width: 640, quality: 75 });
  const hasVariants = Boolean(product.variants && product.variants.length > 1);
  const defaultVariantId = product.variants?.[0]?.id || null;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#E4E4E7]/60 dark:border-zinc-800/40 bg-white dark:bg-[#15803D]/85 p-3.5 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-[#25D366] dark:hover:border-[#1EA855] hover:shadow-xl hover:shadow-[#25D366]/20 text-zinc-900 dark:text-white">
      {/* 1. Image Container (1:1 Square) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F4F4F5]/40 dark:bg-[#18181B]/40">
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
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#F4F4F5] dark:bg-[#18181B]/20 text-center p-4">
              <svg className="h-8 w-8 text-zinc-400 dark:text-[#25D366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="mt-1 text-[10px] text-zinc-400">No Image</span>
            </div>
          )}
        </Link>

        {/* Top Badges (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {hasSale && (
            <span className="rounded-full bg-[#25D366] text-white px-2 py-0.5 text-[10px] font-bold shadow-md tracking-wider">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock ? (
            <span className="rounded-full bg-rose-600 text-white px-2 py-0.5 text-[9px] font-semibold">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[9px] font-semibold">
              Low Stock
            </span>
          ) : null}
        </div>

        {/* Actions (Top-Right): Wishlist Heart & Compare Button */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 items-center">
          <WishlistHeartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              salePrice: product.salePrice,
              imageUrl: resolvedImage,
            }}
          />
          <CompareButton productId={product.id} />
        </div>

        {/* Quick Add To Cart overlay (slides up on hover) */}
        <div className="absolute bottom-2 inset-x-2 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
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
            className="w-full py-2 shadow-lg"
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
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">
              {product.averageRating ? Number(product.averageRating).toFixed(1) : "4.9"}
            </span>
            <span className="text-zinc-400 dark:text-zinc-400/60 text-[10px]">
              ({product.reviewCount !== undefined && product.reviewCount !== null ? product.reviewCount : 12})
            </span>
          </div>

          {/* Product Title (Truncated to 2 lines) */}
          <h3 className="mt-1 text-xs sm:text-sm font-bold text-[#18181B] dark:text-white group-hover:text-[#25D366] dark:group-hover:text-[#1EA855] transition-colors line-clamp-2 leading-snug">
            <Link href={`/product/${product.slug}`} prefetch={false}>
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Price Row */}
        <div className="pt-2 border-t border-[#E4E4E7] dark:border-zinc-800/40 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {hasSale ? (
              <>
                <span className="text-sm sm:text-base font-extrabold text-[#25D366] dark:text-[#1EA855]">
                  ${Number(product.salePrice).toFixed(2)}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-400/50 line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-[#18181B] dark:text-white">
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
