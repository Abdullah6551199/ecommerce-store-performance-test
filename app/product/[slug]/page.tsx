import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, listCatalogProducts } from "@/lib/products";
import ProductShowcase from "@/components/ProductShowcase";
import ProductCard from "@/components/ProductCard";

import { getAbsoluteUrl, generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { normalizeImageUrl } from "@/lib/utils";

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
      title: "Product Not Found",
    };
  }

  const title = product.seoTitle || `${product.name} | Apex Store`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description ||
    `Buy ${product.name} at the best price with instant shipping.`;
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

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId, 4);

  // Structured Data (JSON-LD)
  const productJsonLd = generateProductJsonLd(product);
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    ...(product.categorySlug && product.categoryName
      ? [{ name: product.categoryName, url: `/category/${product.categorySlug}` }]
      : [{ name: "Catalog", url: "/search" }]),
    { name: product.name, url: `/product/${product.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);
  const productMainImageUrl = product.mainImage
    ? normalizeImageUrl(product.mainImage, { width: 700, quality: 75 })
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-white/50">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        {product.categorySlug && product.categoryName ? (
          <>
            <Link href={`/category/${product.categorySlug}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              {product.categoryName}
            </Link>
            <span>/</span>
          </>
        ) : (
          <>
            <Link href="/search" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Products
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#18C729] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Interactive Product Showcase Grid */}
      <ProductShowcase product={product} />

      {/* Full Description / Details Accordion */}
      {product.description && (
        <section className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-[#0c140f]/60 p-6 sm:p-8 backdrop-blur-md shadow-xl dark:shadow-none space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <svg className="h-5 w-5 text-[#18C729]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Product Description & Specifications
          </h2>
          <div className="prose dark:prose-invert max-w-none text-sm text-zinc-700 dark:text-white/70 whitespace-pre-line leading-relaxed">
            {product.description}
          </div>
        </section>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-zinc-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Related Products</h2>
              <p className="text-xs text-zinc-500 dark:text-white/50">Other popular items from this category.</p>
            </div>
            {product.categorySlug && (
              <Link
                href={`/category/${product.categorySlug}`}
                className="text-xs font-semibold text-emerald-600 dark:text-[#18C729] hover:underline"
              >
                View Category &rarr;
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
