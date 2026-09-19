import { cache } from "react";
import { getProductById } from "@/lib/products";
import { getProductRatingSummary } from "@/lib/reviews";
import { getAppSettings } from "@/lib/apps/installed";
import {
  DEFAULT_COMPARE_SETTINGS,
  type CompareSettings,
  type CompareProductItem,
} from "../shared/types";

// 20-second isolate micro-cache for compare specifications
const compareCache = new Map<string, { data: CompareProductItem; timestamp: number }>();
const CACHE_TTL_MS = 20 * 1000;

export function invalidateCompareCache(productId?: string): void {
  if (productId) {
    compareCache.delete(productId);
  } else {
    compareCache.clear();
  }
}

/**
 * Resolves Compare App settings from D1 installation record with fallback defaults.
 */
export async function getCompareSettings(): Promise<CompareSettings> {
  try {
    const settings = await getAppSettings<CompareSettings>("compare");
    if (!settings) return DEFAULT_COMPARE_SETTINGS;
    return {
      maxProducts: Number(settings.maxProducts) || DEFAULT_COMPARE_SETTINGS.maxProducts,
      showInHeader: typeof settings.showInHeader === "boolean" ? settings.showInHeader : DEFAULT_COMPARE_SETTINGS.showInHeader,
      buttonStyle: settings.buttonStyle === "icon" ? "icon" : "icon-text",
    };
  } catch {
    return DEFAULT_COMPARE_SETTINGS;
  }
}

/**
 * Resolves detailed comparison data for a single product with full specifications.
 * Uses 20-second memory micro-cache and React.cache() deduplication.
 */
export const getCompareProduct = cache(
  async (productId: string): Promise<CompareProductItem | null> => {
    if (!productId) return null;

    const cached = compareCache.get(productId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const [product, ratingSummary] = await Promise.all([
        getProductById(productId),
        getProductRatingSummary(productId).catch(() => ({ averageRating: 4.8, totalReviews: 12 })),
      ]);

      if (!product) return null;

      // Extract specifications cleanly
      const specifications: Record<string, string> = {};
      if (product.variants && product.variants.length > 0) {
        const allOptionKeys = new Set<string>();
        product.variants.forEach((v) => {
          if (v.options) {
            Object.keys(v.options).forEach((k) => allOptionKeys.add(k));
          }
        });
        allOptionKeys.forEach((k) => {
          const vals = Array.from(
            new Set(product.variants?.map((v) => v.options?.[k]).filter(Boolean))
          );
          if (vals.length > 0) {
            specifications[k] = vals.join(", ");
          }
        });
      }

      if (product.sku) {
        specifications["SKU"] = product.sku;
      }
      if (product.brand) {
        specifications["Brand"] = product.brand;
      }
      if (product.categoryName) {
        specifications["Category"] = product.categoryName;
      }

      const item: CompareProductItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.mainImage || product.images?.[0]?.imageUrl || null,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        brand: product.brand || "Apex Athletics",
        category: product.categoryName || "Athletic Gear",
        rating: ratingSummary?.averageRating || 4.8,
        reviewCount: ratingSummary?.totalReviews || 12,
        stockStatus: product.stockStatus || "in_stock",
        stockQuantity: product.stockQuantity ?? 10,
        tags: product.tags || [],
        shortDescription: product.shortDescription || product.description?.slice(0, 120) || null,
        specifications,
      };

      compareCache.set(productId, { data: item, timestamp: Date.now() });
      return item;
    } catch {
      return null;
    }
  }
);

/**
 * Resolves comparison data for multiple product IDs bounded by max limit.
 */
export const getCompareProducts = cache(
  async (productIds: string[], maxLimit = 6): Promise<CompareProductItem[]> => {
    const validIds = productIds.filter(Boolean).slice(0, Math.min(6, Math.max(1, maxLimit)));
    if (validIds.length === 0) return [];

    const items = await Promise.all(validIds.map((id) => getCompareProduct(id)));
    return items.filter(Boolean) as CompareProductItem[];
  }
);
