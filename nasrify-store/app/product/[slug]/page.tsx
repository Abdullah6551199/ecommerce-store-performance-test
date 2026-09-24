import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, listCatalogProducts } from "@/lib/products";
import { getProductBundles } from "@/lib/bundles";
import StorefrontProductBelow from "@/components/apps/StorefrontProductBelow";
import { getProductRatingSummary } from "@/lib/reviews";
import { getAbsoluteUrl, generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { normalizeImageUrl } from "@/lib/utils";
import { getActiveTheme } from "@/lib/themes/loader";
import { renderSection } from "@/lib/themes/engine";
import { StoreData } from "@/lib/themes/types";

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
      title: "Product Not Found | Nasrify Store",
    };
  }

  const effectivePrice = product.salePrice && product.salePrice < product.price
    ? Number(product.salePrice).toFixed(2)
    : Number(product.price).toFixed(2);

  const title = `${product.name} - $${effectivePrice} | Nasrify Store`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description ||
    `Buy ${product.name} for $${effectivePrice} at Nasrify Store with fast shipping, 30-day returns, and full warranty.`;
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

  const [theme, relatedProducts, ratingSummary, productBundles, qaData] = await Promise.all([
    getActiveTheme(),
    getRelatedProducts(product.id, product.categoryId, 4),
    getProductRatingSummary(product.id),
    getProductBundles(product.id),
    import("@/apps/product-qa/lib/questions")
      .then((m) => m.getProductQuestions(product.id, 1, 5))
      .catch(() => ({ questions: [] })),
  ]);

  // Structured Data (JSON-LD) with aggregate rating and Q&A
  const productJsonLd = generateProductJsonLd(product, ratingSummary);
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    ...(product.categorySlug && product.categoryName
      ? [{ name: product.categoryName, url: `/category/${product.categorySlug}` }]
      : [{ name: "Catalog", url: "/shop" }]),
    { name: product.name, url: `/product/${product.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);
  const { generateQAJsonLd } = await import("@/lib/seo");
  const qaJsonLd = generateQAJsonLd(product.name, qaData?.questions || []);
  const productMainImageUrl = product.mainImage
    ? normalizeImageUrl(product.mainImage, { width: 900, quality: 80 })
    : null;

  // Prepare normalized storeData for theme section engine
  const storeData: StoreData = {
    product: {
      ...product,
      images:
        (product as any).images && (product as any).images.length > 0
          ? (product as any).images
          : product.mainImage
          ? [product.mainImage]
          : [],
      imageUrl: product.mainImage,
      rating: ratingSummary?.averageRating || 4.8,
      reviewsCount: ratingSummary?.totalReviews || 0,
      variants: product.variants || [],
      brand: (product as any).brand || "Nasrify Essentials",
    },
    products: relatedProducts,
    rating_summary: ratingSummary,
    product_bundles: productBundles,
  };

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
      {qaJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(qaJsonLd) }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 font-[family-name:var(--theme-font-body)]">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-[var(--theme-text-muted,#71717A)]">
          <Link href="/" className="hover:text-[var(--theme-primary,#25D366)] transition-colors">
            Home
          </Link>
          <span>/</span>
          {product.categorySlug && product.categoryName ? (
            <>
              <Link
                href={`/category/${product.categorySlug}`}
                className="hover:text-[var(--theme-primary,#25D366)] transition-colors"
              >
                {product.categoryName}
              </Link>
              <span>/</span>
            </>
          ) : (
            <>
              <Link href="/shop" className="hover:text-[var(--theme-primary,#25D366)] transition-colors">
                Shop
              </Link>
              <span>/</span>
            </>
          )}
          <span className="font-semibold text-[var(--theme-text,#18181B)] truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Gallery & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {renderSection(
            {
              id: "sec-product-gallery",
              type: "product_gallery",
              variant: "classic",
              enabled: true,
              settings: { layout: "carousel", thumbnails_position: "bottom", zoom: "on" },
            },
            theme.settings,
            storeData
          )}

          {renderSection(
            {
              id: "sec-product-info",
              type: "product_info",
              variant: "standard",
              enabled: true,
              settings: {
                show_sku: true,
                show_brand: true,
                show_rating: true,
                show_compare: true,
                show_wishlist: true,
              },
            },
            theme.settings,
            storeData
          )}
        </div>

        {/* Product Tabs */}
        {renderSection(
          {
            id: "sec-product-tabs",
            type: "product_tabs",
            variant: "standard",
            enabled: true,
            settings: { default_tab: "description" },
          },
          theme.settings,
          storeData
        )}

        {/* Product Reviews */}
        {renderSection(
          {
            id: "sec-product-reviews",
            type: "product_reviews_section",
            variant: "standard",
            enabled: true,
            settings: { heading: "Customer Reviews", show_summary: true, show_form: true },
          },
          theme.settings,
          storeData
        )}

        {/* Related Products */}
        {renderSection(
          {
            id: "sec-product-related",
            type: "product_related",
            variant: "grid",
            enabled: true,
            settings: { heading: "Related Products", max_products: 4, columns: 4 },
          },
          theme.settings,
          storeData
        )}

        {/* Extension Point: Apps rendering below product/tabs */}
        <StorefrontProductBelow productId={product.id} />
      </div>
    </>
  );
}
