"use client";

import React, { useState } from "react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfoPanel from "@/components/product/ProductInfoPanel";
import type { ProductWithImagesAndCategory } from "@/lib/products";

interface ProductShowcaseProps {
  product: ProductWithImagesAndCategory;
  averageRating?: number;
  reviewCount?: number;
}

/**
 * Big White Card Product Showcase component (Stage 18.3 Redesign).
 * Encapsulates:
 * - 3-column desktop layout (thumbnails | main image with Walmart zoom | sticky info panel)
 * - State synchronization between variant selections and gallery photos
 * - Smooth scroll coordination to product tabs
 */
export default function ProductShowcase({
  product,
  averageRating = 4.8,
  reviewCount = 24,
}: ProductShowcaseProps): React.JSX.Element {
  const [activeVariantImage, setActiveVariantImage] = useState<string | null>(null);

  const hasSale = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasSale
    ? Math.round(((product.price - Number(product.salePrice)) / product.price) * 100)
    : 0;

  const handleReviewsClick = () => {
    const el = document.getElementById("product-tabs");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="rounded-3xl bg-white dark:bg-[#3C0561] shadow-lg shadow-purple-100/50 dark:shadow-purple-900/30 p-6 md:p-8 border border-purple-100 dark:border-purple-700"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (7 cols on lg): Thumbnails & Main Image with Walmart Hover Zoom */}
        <div className="lg:col-span-7">
          <ProductGallery
            mainImage={product.mainImage}
            images={product.images}
            variants={product.variants}
            productName={product.name}
            discountPercent={discountPercent}
            activeVariantImage={activeVariantImage}
          />
        </div>

        {/* Right Column (5 cols on lg): Sticky Product Info Panel */}
        <div className="lg:col-span-5">
          <ProductInfoPanel
            productId={product.id}
            productName={product.name}
            brand={product.brand}
            basePrice={product.price}
            baseSalePrice={product.salePrice}
            compareAtPrice={product.compareAtPrice}
            stockStatus={product.stockStatus}
            stockQuantity={product.stockQuantity}
            trackInventory={product.trackInventory}
            allowBackorders={product.allowBackorders}
            lowStockThreshold={product.lowStockThreshold}
            baseSku={product.sku}
            shortDescription={product.shortDescription}
            averageRating={averageRating}
            reviewCount={reviewCount}
            variants={product.variants}
            onSelectVariantImage={setActiveVariantImage}
            onReviewsClick={handleReviewsClick}
          />
        </div>
      </div>
    </div>
  );
}
