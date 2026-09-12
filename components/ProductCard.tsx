import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProductWithImagesAndCategory, CatalogProductItem } from "@/lib/products";
import { normalizeImageUrl } from "@/lib/utils";
import QuickAddToCart from "@/components/QuickAddToCart";
import WishlistHeartButton from "@/components/WishlistHeartButton";

interface ProductCardProps {
  product: ProductWithImagesAndCategory | CatalogProductItem;
  isPriority?: boolean;
}

/**
 * High-performance Server Component for Product Card.
 * All markup, imagery, badges, and layout are rendered at the server/edge.
 * Interactive cart mutation is delegated to the <QuickAddToCart /> client island.
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
    <div
      className="group relative flex flex-col overflow-hidden border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-[#0c140f]/80 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#18C729]/50 hover:shadow-xl dark:hover:shadow-2xl shadow-sm text-zinc-900 dark:text-white"
      style={{ borderRadius: "var(--radius-card, 1.5rem)" }}
    >
      {/* Product Image Link Container */}
      <Link
        href={`/product/${product.slug}`}
        prefetch={false}
        className="relative block aspect-[4/4] w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black/40"
      >
        {resolvedImage ? (
          <Image
            src={resolvedImage}
            alt={product.name}
            fill
            priority={isPriority}
            {...(isPriority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-100 dark:bg-white/[0.02] p-4 text-center">
            <svg className="h-10 w-10 text-zinc-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="mt-2 text-[10px] text-zinc-500 dark:text-white/40 font-mono">No Image</span>
          </div>
        )}

        {/* Gradient dark overlay on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
          {hasSale && (
            <span className="rounded-full border border-red-500/30 bg-red-500/80 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-md">
              -{discountPercent}% OFF
            </span>
          )}
          {product.brand && (
            <span className="rounded-full border border-zinc-300 dark:border-white/20 bg-white/80 dark:bg-black/60 px-2 py-0.5 text-[10px] font-medium text-zinc-800 dark:text-white/90 backdrop-blur-md">
              {product.brand}
            </span>
          )}
          {isOutOfStock ? (
            <span className="rounded-full bg-red-100 dark:bg-red-950/80 border border-red-400 dark:border-red-500/40 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-300 backdrop-blur-md">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-400 dark:border-amber-500/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 backdrop-blur-md">
              Low Stock
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Toggle (Top-right corner) */}
        <div className="absolute top-3 right-3 z-20">
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
        </div>
      </Link>

      {/* Product Content Container */}
      <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
        <div>
          {product.categoryName && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {product.categoryName}
            </span>
          )}
          <h3 className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-white group-hover:text-[#18C729] transition-colors line-clamp-1">
            <Link href={`/product/${product.slug}`} prefetch={false}>{product.name}</Link>
          </h3>
          {product.shortDescription && (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price & Action Area */}
        <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {hasSale ? (
              <>
                <span
                  className="text-base font-extrabold text-[#18C729]"
                >
                  ${Number(product.salePrice).toFixed(2)}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through font-mono">
                  ${Number(product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

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
  );
}
