/**
 * Domain TypeScript types and interfaces for the dynamic e-commerce store.
 * Strictly type contracts; no static business data or mock records.
 */

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  inventoryCount: number;
  isAvailable: boolean;
  images: ProductImage[];
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  selectedVariantId?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  currency: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
