import React from "react";
import Link from "next/link";
import type { ProductWithImagesAndCategory } from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchaseSection from "@/components/ProductPurchaseSection";

interface ProductShowcaseProps {
  product: ProductWithImagesAndCategory;
}

/**
 * Server Component for Product Showcase / Detail Page.
 * Title, brand, short description, catalog tags, and surrounding layout are rendered at the server/edge.
 * Interactive gallery and variant/purchase options are client islands.
 */
export default function ProductShowcase({ product }: ProductShowcaseProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Gallery Column (7 cols on lg) - Client Island */}
      <div className="lg:col-span-7">
        <ProductGallery
          mainImage={product.mainImage}
          images={product.images}
          variants={product.variants}
          productName={product.name}
        />
      </div>

      {/* Product Details & Purchase Column (5 cols on lg) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2">
          {product.brand && (
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-[#FEF500]">
              {product.brand}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {product.name}
          </h1>
        </div>

        {/* Short Description (Server-rendered) */}
        {product.shortDescription && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Interactive Variant Selection & Add to Cart (Client Island) */}
        <ProductPurchaseSection
          productId={product.id}
          productName={product.name}
          basePrice={product.price}
          baseSalePrice={product.salePrice}
          compareAtPrice={product.compareAtPrice}
          stockStatus={product.stockStatus}
          stockQuantity={product.stockQuantity}
          trackInventory={product.trackInventory}
          allowBackorders={product.allowBackorders}
          lowStockThreshold={product.lowStockThreshold}
          baseSku={product.sku}
          variants={product.variants}
        />

        {/* Catalog Tags (Server-rendered) */}
        {product.tags && product.tags.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Catalog Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:border-[#18C729]/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
