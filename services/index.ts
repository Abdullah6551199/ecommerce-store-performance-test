import { Product, Category, Cart, PaginationParams, ApiResponse } from "@/types";

/**
 * Service Layer Abstractions for Dynamic Store Architecture.
 * Future business logic will connect to database, R2, or external APIs here.
 * Zero hardcoded data.
 */

export interface IProductsService {
  getProducts: (params?: PaginationParams) => Promise<ApiResponse<Product[]>>;
  getProductBySlug: (slug: string) => Promise<ApiResponse<Product | null>>;
  getProductsByCategory: (categoryId: string, params?: PaginationParams) => Promise<ApiResponse<Product[]>>;
}

export interface ICategoriesService {
  getCategories: () => Promise<ApiResponse<Category[]>>;
  getCategoryBySlug: (slug: string) => Promise<ApiResponse<Category | null>>;
}

export interface ICartService {
  getCart: (cartId: string) => Promise<ApiResponse<Cart>>;
  addToCart: (cartId: string, productId: string, quantity: number) => Promise<ApiResponse<Cart>>;
  removeFromCart: (cartId: string, productId: string) => Promise<ApiResponse<Cart>>;
}

class ProductsService implements IProductsService {
  async getProducts(_params?: PaginationParams): Promise<ApiResponse<Product[]>> {
    return { success: true, data: [] };
  }

  async getProductBySlug(_slug: string): Promise<ApiResponse<Product | null>> {
    return { success: true, data: null };
  }

  async getProductsByCategory(_categoryId: string, _params?: PaginationParams): Promise<ApiResponse<Product[]>> {
    return { success: true, data: [] };
  }
}

class CategoriesService implements ICategoriesService {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return { success: true, data: [] };
  }

  async getCategoryBySlug(_slug: string): Promise<ApiResponse<Category | null>> {
    return { success: true, data: null };
  }
}

class CartService implements ICartService {
  async getCart(cartId: string): Promise<ApiResponse<Cart>> {
    return {
      success: true,
      data: {
        id: cartId,
        items: [],
        subtotal: 0,
        total: 0,
        currency: "USD",
        updatedAt: new Date().toISOString(),
      },
    };
  }

  async addToCart(cartId: string, _productId: string, _quantity: number): Promise<ApiResponse<Cart>> {
    return this.getCart(cartId);
  }

  async removeFromCart(cartId: string, _productId: string): Promise<ApiResponse<Cart>> {
    return this.getCart(cartId);
  }
}

export const productsService: IProductsService = new ProductsService();
export const categoriesService: ICategoriesService = new CategoriesService();
export const cartService: ICartService = new CartService();
