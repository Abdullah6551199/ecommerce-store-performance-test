import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/products";
import { listCategories } from "@/lib/categories";
import { listPages } from "@/lib/cms";
import { getBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Dynamic sitemap generation containing:
 * 1. Root & Core Static Pages (Home, Shop, About, Contact, Policies, FAQ, Wishlist, Cart)
 * 2. All Published Custom CMS Pages
 * 3. All Active Categories
 * 4. All Published Products
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  try {
    const [products, categories, cmsPages] = await Promise.all([
      listProducts({ status: "published", limit: 500 }).catch(() => []),
      listCategories({ status: "active" }).catch(() => []),
      listPages().catch(() => []),
    ]);

    const coreRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/faq`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/shipping`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${baseUrl}/returns`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/wishlist`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
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

    // Published Custom CMS Pages
    const customPageRoutes: MetadataRoute.Sitemap = cmsPages
      .filter((p: any) => p.isPublished && !p.isDefault)
      .map((p: any) => ({
        url: `${baseUrl}/pages/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      }));

    const productRoutes: MetadataRoute.Sitemap = products.map((p: any) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c: any) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...coreRoutes, ...customPageRoutes, ...categoryRoutes, ...productRoutes];
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
