import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/products";
import { listCategories } from "@/lib/categories";
import { getBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Dynamic sitemap generation containing:
 * 1. Root & Static Pages (Home, Search, Cart, Checkout)
 * 2. All Published Products
 * 3. All Active Categories
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  try {
    const [products, categories] = await Promise.all([
      listProducts({ status: "published", limit: 500 }).catch(() => []),
      listCategories({ status: "active" }).catch(() => []),
    ]);

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/cart`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/checkout`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.4,
      },
    ];

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("[Sitemap Generation] Error:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }
}
