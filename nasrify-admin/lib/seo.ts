import type { ProductWithImagesAndCategory } from "./products";
import type { CategoryRecord } from "./categories";

/**
 * Get the canonical base URL for the store
 */
export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl && envUrl.startsWith("http")) {
    return envUrl.replace(/\/+$/, "");
  }
  return "https://ecommerce-store-perf-test.zia291930.workers.dev";
}

/**
 * Construct an absolute URL for a given relative path
 */
export function getAbsoluteUrl(path: string = ""): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Generate Product schema.org structured data (JSON-LD)
 */
export function generateProductJsonLd(
  product: ProductWithImagesAndCategory,
  ratingSummary?: { averageRating: number; totalReviews: number },
  reviewList?: Array<{ customerName: string; rating: number; content: string; createdAt: string }>
) {
  const baseUrl = getBaseUrl();
  const productUrl = `${baseUrl}/product/${product.slug}`;
  const images = (product.images && product.images.length > 0
    ? product.images.map((img) => img.imageUrl)
    : [product.mainImage]
  ).filter(Boolean).map((img) => (img?.startsWith("http") ? img : `${baseUrl}${img}`));

  const currentPrice =
    product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;

  const isOutOfStock =
    product.stockStatus === "out_of_stock" ||
    (product.trackInventory && product.stockQuantity <= 0 && !product.allowBackorders);

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription || product.shortDescription || product.description || product.name,
    image: images.length > 0 ? images : undefined,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Apex Store",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "USD",
      price: currentPrice.toFixed(2),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Apex Store",
      },
    },
  };

  if (ratingSummary && ratingSummary.totalReviews > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(ratingSummary.averageRating),
      reviewCount: String(ratingSummary.totalReviews),
    };
  }

  if (reviewList && reviewList.length > 0) {
    jsonLd.review = reviewList.slice(0, 10).map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.customerName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
      },
      reviewBody: r.content,
      datePublished: r.createdAt ? r.createdAt.split("T")[0] : undefined,
    }));
  }

  return jsonLd;
}

/**
 * Generate CollectionPage schema.org structured data (JSON-LD) for Category pages
 */
export function generateCategoryJsonLd(
  category: CategoryRecord,
  products: ProductWithImagesAndCategory[] = []
) {
  const baseUrl = getBaseUrl();
  const categoryUrl = `${baseUrl}/category/${category.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.seoDescription || category.description || `Browse our ${category.name} collection.`,
    url: categoryUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/product/${p.slug}`,
        name: p.name,
      })),
    },
  };
}

/**
 * Generate BreadcrumbList schema.org structured data (JSON-LD)
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };
}
