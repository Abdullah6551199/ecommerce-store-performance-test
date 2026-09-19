import type { ProductBundleRecord } from "@/lib/db";

export interface BundlesAppSettings {
  enableHomepageSection: boolean;
  enableProductCrossSell: boolean;
  enableCartDiscount: boolean;
  bundleBadgeText: string;
  maxBundlesPerSection: number;
}

export const DEFAULT_BUNDLES_SETTINGS: BundlesAppSettings = {
  enableHomepageSection: true,
  enableProductCrossSell: true,
  enableCartDiscount: true,
  bundleBadgeText: "Save more with bundle",
  maxBundlesPerSection: 4,
};

export interface BundleItemDetail {
  id: string;
  bundleId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  sortOrder: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    mainImage: string | null;
    stockStatus: string;
    stockQuantity: number;
    brand: string | null;
  };
}

export interface BundleWithItems extends ProductBundleRecord {
  items: BundleItemDetail[];
  savingsAmount: number;
}

export interface ListBundlesOptions {
  status?: "active" | "draft" | "all";
  search?: string;
  isFeatured?: boolean;
  sortBy?: "name" | "price" | "discount" | "createdAt" | "sortOrder";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface CreateBundleInput {
  name: string;
  slug?: string;
  description?: string | null;
  bundlePrice: number;
  imageUrl?: string | null;
  status?: "active" | "draft";
  isFeatured?: boolean;
  sortOrder?: number;
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity?: number;
    sortOrder?: number;
  }>;
}

export interface UpdateBundleInput extends Partial<CreateBundleInput> {}
