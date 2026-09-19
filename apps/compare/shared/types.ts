export interface CompareSettings {
  maxProducts: number;
  showInHeader: boolean;
  buttonStyle: "icon" | "icon-text";
}

export const DEFAULT_COMPARE_SETTINGS: CompareSettings = {
  maxProducts: 4,
  showInHeader: true,
  buttonStyle: "icon-text",
};

export const LOCAL_STORAGE_COMPARE_KEY = "compare_products_v1";

export interface CompareProductItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  brand: string | null;
  category: string | null;
  rating: number;
  reviewCount: number;
  stockStatus: string;
  stockQuantity: number;
  tags: string[];
  shortDescription: string | null;
  specifications: Record<string, string>;
}

export interface CompareState {
  productIds: string[];
}
