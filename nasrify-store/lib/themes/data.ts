import { cache } from "react";
import { getDb, products, categories, productImages } from "../db";
import { eq, inArray, desc, asc, and } from "drizzle-orm";

export interface ThemeProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  compareAtPrice: number | null;
  stockStatus: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

export interface ThemeCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  productCount?: number;
}

const CACHE_TTL_MS = 20 * 1000; // 20 seconds micro-cache

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const dataCache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = dataCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  dataCache.delete(key);
  return null;
}

function setCached<T>(key: string, data: T): void {
  dataCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch products for theme sections (ProductGrid, ProductCarousel)
 * Micro-cached 20s, wrapped with React.cache(), strictly projected columns, LIMIT
 */
export const fetchProducts = cache(
  async (ids?: string[], limit: number = 8): Promise<ThemeProductItem[]> => {
    const cacheKey = `theme_products_${ids ? ids.sort().join(",") : "all"}_limit_${limit}`;
    const cached = getCached<ThemeProductItem[]>(cacheKey);
    if (cached) return cached;

    const db = getDb();
    if (!db) {
      return getFallbackProducts().slice(0, limit);
    }

    try {
      let productRows;
      if (ids && ids.length > 0) {
        productRows = await db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            salePrice: products.salePrice,
            compareAtPrice: products.compareAtPrice,
            stockStatus: products.stockStatus,
          })
          .from(products)
          .where(and(eq(products.status, "published"), inArray(products.id, ids)))
          .limit(limit);
      } else {
        productRows = await db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            salePrice: products.salePrice,
            compareAtPrice: products.compareAtPrice,
            stockStatus: products.stockStatus,
          })
          .from(products)
          .where(eq(products.status, "published"))
          .orderBy(desc(products.createdAt))
          .limit(limit);
      }

      if (productRows.length === 0) {
        return getFallbackProducts().slice(0, limit);
      }

      const pIds = productRows.map((p) => p.id);
      const imagesRows = await db
        .select({
          productId: productImages.productId,
          imageUrl: productImages.imageUrl,
          isMain: productImages.isMain,
        })
        .from(productImages)
        .where(inArray(productImages.productId, pIds))
        .orderBy(asc(productImages.sortOrder));

      const imgMap = new Map<string, string>();
      for (const img of imagesRows) {
        if (!imgMap.has(img.productId) || img.isMain) {
          imgMap.set(img.productId, img.imageUrl);
        }
      }

      const result: ThemeProductItem[] = productRows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        compareAtPrice: p.compareAtPrice,
        stockStatus: p.stockStatus,
        rating: 5,
        reviewCount: 12,
        imageUrl:
          imgMap.get(p.id) ||
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
      }));

      setCached(cacheKey, result);
      return result;
    } catch (err) {
      console.error("[Themes Engine] fetchProducts error:", err);
      return getFallbackProducts().slice(0, limit);
    }
  }
);

/**
 * Fetch categories for theme sections (Categories)
 * Micro-cached 20s, wrapped with React.cache(), strictly projected columns, LIMIT
 */
export const fetchCategories = cache(
  async (ids?: string[], limit: number = 6): Promise<ThemeCategoryItem[]> => {
    const cacheKey = `theme_categories_${ids ? ids.sort().join(",") : "all"}_limit_${limit}`;
    const cached = getCached<ThemeCategoryItem[]>(cacheKey);
    if (cached) return cached;

    const db = getDb();
    if (!db) {
      return getFallbackCategories().slice(0, limit);
    }

    try {
      let catRows;
      if (ids && ids.length > 0) {
        catRows = await db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            description: categories.description,
            imageUrl: categories.imageUrl,
          })
          .from(categories)
          .where(and(eq(categories.status, "active"), inArray(categories.id, ids)))
          .limit(limit);
      } else {
        catRows = await db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            description: categories.description,
            imageUrl: categories.imageUrl,
          })
          .from(categories)
          .where(eq(categories.status, "active"))
          .orderBy(asc(categories.sortOrder))
          .limit(limit);
      }

      if (catRows.length === 0) {
        return getFallbackCategories().slice(0, limit);
      }

      const result: ThemeCategoryItem[] = catRows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl:
          c.imageUrl ||
          "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=600&auto=format&fit=crop",
      }));

      setCached(cacheKey, result);
      return result;
    } catch (err) {
      console.error("[Themes Engine] fetchCategories error:", err);
      return getFallbackCategories().slice(0, limit);
    }
  }
);

function getFallbackProducts(): ThemeProductItem[] {
  return [
    {
      id: "prod-1",
      name: "Minimalist Aero Runner",
      slug: "minimalist-aero-runner",
      price: 129,
      salePrice: 99,
      compareAtPrice: 149,
      stockStatus: "in_stock",
      rating: 5,
      reviewCount: 24,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "prod-2",
      name: "Obsidian Tech Fleece Jacket",
      slug: "obsidian-tech-fleece-jacket",
      price: 189,
      salePrice: null,
      compareAtPrice: null,
      stockStatus: "in_stock",
      rating: 5,
      reviewCount: 18,
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "prod-3",
      name: "Seamless Performance Leggings",
      slug: "seamless-performance-leggings",
      price: 79,
      salePrice: 65,
      compareAtPrice: 85,
      stockStatus: "in_stock",
      rating: 5,
      reviewCount: 31,
      imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "prod-4",
      name: "Hydro-Shield Waterproof Duffle",
      slug: "hydro-shield-waterproof-duffle",
      price: 110,
      salePrice: null,
      compareAtPrice: null,
      stockStatus: "in_stock",
      rating: 4,
      reviewCount: 14,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
    },
  ];
}

function getFallbackCategories(): ThemeCategoryItem[] {
  return [
    {
      id: "cat-1",
      name: "Footwear",
      slug: "footwear",
      description: "Performance road and trail sneakers",
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "cat-2",
      name: "Apparel",
      slug: "apparel",
      description: "Engineered breathable athletics",
      imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "cat-3",
      name: "Accessories",
      slug: "accessories",
      description: "Essential bags, hats, and gear",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "cat-4",
      name: "Equipment",
      slug: "equipment",
      description: "Training accessories and recovery",
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    },
  ];
}
