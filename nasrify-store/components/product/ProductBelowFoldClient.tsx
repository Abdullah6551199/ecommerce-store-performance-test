"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ProductWithImagesAndCategory } from "@/lib/products";
import type { BundleWithItems } from "@/lib/bundles";

// Below-the-fold CSR Island skeletons
const ProductTabsSkeleton = () => (
  <div className="rounded-3xl border border-purple-100 dark:border-purple-800/40 bg-white/60 dark:bg-[#3C0561]/40 p-8 min-h-[220px] animate-pulse">
    <div className="flex gap-4 border-b border-purple-100 dark:border-purple-800/40 pb-4 mb-6">
      <div className="h-6 w-28 bg-purple-100 dark:bg-purple-800/50 rounded-lg" />
      <div className="h-6 w-28 bg-purple-100 dark:bg-purple-800/50 rounded-lg" />
      <div className="h-6 w-36 bg-purple-100 dark:bg-purple-800/50 rounded-lg" />
    </div>
    <div className="space-y-3">
      <div className="h-4 w-3/4 bg-purple-100 dark:bg-purple-800/40 rounded" />
      <div className="h-4 w-5/6 bg-purple-100 dark:bg-purple-800/40 rounded" />
      <div className="h-4 w-1/2 bg-purple-100 dark:bg-purple-800/40 rounded" />
    </div>
  </div>
);

const RelatedProductsSkeleton = () => (
  <div className="space-y-4 pt-8 border-t border-purple-100 dark:border-purple-800/40 animate-pulse">
    <div className="h-6 w-48 bg-purple-100 dark:bg-purple-800/50 rounded-lg" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-64 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30" />
      ))}
    </div>
  </div>
);

// Below-the-fold interactive CSR Islands (ssr: false)
const ProductTabs = dynamic(() => import("@/components/product/ProductTabs"), {
  ssr: false,
  loading: () => <ProductTabsSkeleton />,
});

const RelatedProductsCarousel = dynamic(
  () => import("@/components/product/RelatedProductsCarousel"),
  {
    ssr: false,
    loading: () => <RelatedProductsSkeleton />,
  }
);

const ProductBundleCrossSell = dynamic(
  () => import("@/components/product/ProductBundleCrossSell"),
  { ssr: false }
);

const RecentlyViewedCarousel = dynamic(
  () => import("@/components/product/RecentlyViewedCarousel"),
  { ssr: false }
);

const MobileStickyCartBar = dynamic(
  () => import("@/components/product/MobileStickyCartBar"),
  { ssr: false }
);

interface Props {
  product: ProductWithImagesAndCategory;
  reviewCount: number;
  productBundles: BundleWithItems[];
  relatedProducts: ProductWithImagesAndCategory[];
  children?: React.ReactNode;
}

export default function ProductBelowFoldClient({
  product,
  reviewCount,
  productBundles,
  relatedProducts,
  children,
}: Props): React.JSX.Element {
  return (
    <>
      {/* Product Bundle Cross-Sell ("Also available in bundle") */}
      {productBundles.length > 0 && (
        <ProductBundleCrossSell bundles={productBundles} />
      )}

      {/* B4: Product Tabs Section (Description, Specifications, Shipping & Returns) */}
      <ProductTabs
        product={product}
        reviewCount={reviewCount}
      />

      {/* Extension Point: Apps rendering below product/tabs */}
      {children}

      {/* B5: Related Products Carousel ("You May Also Like") */}
      {relatedProducts.length > 0 && (
        <RelatedProductsCarousel
          products={relatedProducts}
          categorySlug={product.categorySlug}
        />
      )}

      {/* B6: Recently Viewed Carousel ("Recently Viewed") */}
      <RecentlyViewedCarousel currentProductId={product.id} />

      {/* B9: Mobile Sticky Add-to-Cart Bar */}
      <MobileStickyCartBar
        productId={product.id}
        productName={product.name}
        price={product.price}
        salePrice={product.salePrice}
        mainImage={product.mainImage}
        stockStatus={product.stockStatus}
      />
    </>
  );
}
