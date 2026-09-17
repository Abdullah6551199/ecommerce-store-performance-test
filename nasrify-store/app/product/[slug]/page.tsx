import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, listCatalogProducts } from "@/lib/products";
import { getProductBundles } from "@/lib/bundles";
import ProductShowcase from "@/components/ProductShowcase";
import StorefrontProductBelow from "@/components/apps/StorefrontProductBelow";
import { getProductRatingSummary } from "@/lib/reviews";
import { getAbsoluteUrl, generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { normalizeImageUrl } from "@/lib/utils";

import ProductBelowFoldClient from "@/components/product/ProductBelowFoldClient";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const prods = await listCatalogProducts({ status: "published", limit: 50 });
    return prods.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    return {
      title: "Product Not Found | Apex Store",
    };
  }

  const effectivePrice = product.salePrice && product.salePrice < product.price
    ? Number(product.salePrice).toFixed(2)
    : Number(product.price).toFixed(2);

  const title = `${product.name} - $${effectivePrice} | Apex Store`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description ||
    `Buy ${product.name} for $${effectivePrice} at Apex Store with fast shipping, 30-day returns, and full warranty.`;
  const canonicalUrl = getAbsoluteUrl(`/product/${product.slug}`);
  const mainImage = product.mainImage?.startsWith("http")
    ? product.mainImage
    : product.mainImage
    ? getAbsoluteUrl(product.mainImage)
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: mainImage
        ? [
            {
              url: mainImage,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: mainImage ? [mainImage] : undefined,
    },
  };
}

export default async function ProductDetailsPage({ params }: ProductPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  // Optimized parallel SSR pass: only fetch essential product data; eliminate heavy review list query
  const [relatedProducts, ratingSummary, productBundles] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, 4),
    getProductRatingSummary(product.id),
    getProductBundles(product.id),
  ]);

  // Structured Data (JSON-LD) with aggregate rating
  const productJsonLd = generateProductJsonLd(product, ratingSummary);
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    ...(product.categorySlug && product.categoryName
      ? [{ name: product.categoryName, url: `/category/${product.categorySlug}` }]
      : [{ name: "Catalog", url: "/shop" }]),
    { name: product.name, url: `/product/${product.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);
  const productMainImageUrl = product.mainImage
    ? normalizeImageUrl(product.mainImage, { width: 900, quality: 80 })
    : null;

  return (
    <>
      {productMainImageUrl && (
        <link
          rel="preload"
          as="image"
          href={productMainImageUrl}
          fetchPriority="high"
        />
      )}

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* B7: Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-purple-700/80 dark:text-purple-300">
          <Link href="/" className="hover:text-purple-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-purple-300 dark:text-purple-600">/</span>
          {product.categorySlug && product.categoryName ? (
            <>
              <Link
                href={`/category/${product.categorySlug}`}
                className="hover:text-purple-900 dark:hover:text-white transition-colors"
              >
                {product.categoryName}
              </Link>
              <span className="text-purple-300 dark:text-purple-600">/</span>
            </>
          ) : (
            <>
              <Link href="/shop" className="hover:text-purple-900 dark:hover:text-white transition-colors">
                Shop
              </Link>
              <span className="text-purple-300 dark:text-purple-600">/</span>
            </>
          )}
          <span className="text-purple-500 dark:text-purple-200 font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* B1-B3: Main Product Showcase (Big White Card with 3-Column Layout & Walmart Hover Zoom) */}
        <ProductShowcase
          product={product}
          averageRating={ratingSummary.averageRating || 4.8}
          reviewCount={ratingSummary.totalReviews || 24}
        />

        {/* Below-the-fold interactive CSR Islands */}
        <ProductBelowFoldClient
          product={product}
          reviewCount={ratingSummary.totalReviews || 0}
          productBundles={productBundles}
          relatedProducts={relatedProducts}
        >
          {/* Extension Point: Apps rendering below product/tabs */}
          <StorefrontProductBelow productId={product.id} />
        </ProductBelowFoldClient>
      </div>
    </>
  );
}
