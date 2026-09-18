export interface WishlistAppSettings {
  showOnProductCards: boolean;
  showInHeader: boolean;
  requireLogin: boolean;
  iconPosition: "top-right" | "top-left" | "below-image";
}

export const DEFAULT_WISHLIST_SETTINGS: WishlistAppSettings = {
  showOnProductCards: true,
  showInHeader: true,
  requireLogin: true,
  iconPosition: "top-right",
};

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: string;
  mainImage?: string | null;
}

export interface WishlistRecord {
  id: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
}
