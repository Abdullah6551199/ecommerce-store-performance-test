"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useCart } from "./CartContext";

export const LOCAL_STORAGE_WISHLIST_KEY = "apex_wishlist_v1";

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl: string;
  addedAt: string;
}

export interface StoredWishlist {
  items: WishlistItem[];
  updatedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: {
    productId: string;
    slug: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
  }) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: {
    productId: string;
    slug: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
  }) => boolean;
  addToCart: (productId: string) => Promise<boolean>;
  moveToCart: (productId: string) => Promise<boolean>;
  addAllToCart: () => Promise<void>;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, addItems, showToast } = useCart();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredWishlist;
          if (parsed && Array.isArray(parsed.items)) {
            setItems(parsed.items);
          }
        }
      }
    } catch (err) {
      console.warn("[WishlistContext] LocalStorage read failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist to localStorage
  const persistWishlist = useCallback((newItems: WishlistItem[]) => {
    setItems(newItems);
    if (typeof window !== "undefined") {
      try {
        const payload: StoredWishlist = {
          items: newItems,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn("[WishlistContext] LocalStorage write failed:", err);
      }
    }
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  const addToWishlist = useCallback(
    (product: {
      productId: string;
      slug: string;
      name: string;
      price: number;
      salePrice?: number | null;
      imageUrl?: string | null;
    }) => {
      if (isInWishlist(product.productId)) return;

      const newItem: WishlistItem = {
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice ?? null,
        imageUrl: product.imageUrl || "",
        addedAt: new Date().toISOString(),
      };

      const updated = [newItem, ...items];
      persistWishlist(updated);
      showToast(`Added "${product.name}" to wishlist`, "success");
    },
    [items, isInWishlist, persistWishlist, showToast]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      const existing = items.find((it) => it.productId === productId);
      const updated = items.filter((it) => it.productId !== productId);
      persistWishlist(updated);
      if (existing) {
        showToast(`Removed "${existing.name}" from wishlist`, "success");
      }
    },
    [items, persistWishlist, showToast]
  );

  const toggleWishlist = useCallback(
    (product: {
      productId: string;
      slug: string;
      name: string;
      price: number;
      salePrice?: number | null;
      imageUrl?: string | null;
    }): boolean => {
      if (isInWishlist(product.productId)) {
        removeFromWishlist(product.productId);
        return false;
      } else {
        addToWishlist(product);
        return true;
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist]
  );

  // Individual add to cart (keeps item in wishlist)
  const addToCart = useCallback(
    async (productId: string): Promise<boolean> => {
      const item = items.find((it) => it.productId === productId);
      if (!item) return false;

      const success = await addItem(item.productId, null, 1, {
        productName: item.name,
        productSlug: item.slug,
        imageUrl: item.imageUrl,
        price: item.price,
        salePrice: item.salePrice,
        openOnSuccess: true,
      });

      return success;
    },
    [items, addItem]
  );

  // Move to cart (adds to cart and removes from wishlist)
  const moveToCart = useCallback(
    async (productId: string): Promise<boolean> => {
      const item = items.find((it) => it.productId === productId);
      if (!item) return false;

      const success = await addItem(item.productId, null, 1, {
        productName: item.name,
        productSlug: item.slug,
        imageUrl: item.imageUrl,
        price: item.price,
        salePrice: item.salePrice,
        openOnSuccess: true,
      });

      if (success) {
        const updated = items.filter((it) => it.productId !== productId);
        persistWishlist(updated);
      }

      return success;
    },
    [items, addItem, persistWishlist]
  );

  // Bulk add all wishlist items to cart in a single atomic operation
  const addAllToCart = useCallback(async () => {
    if (items.length === 0) return;

    const entries = items.map((item) => ({
      productId: item.productId,
      variantId: null,
      quantity: 1,
      options: {
        productName: item.name,
        productSlug: item.slug,
        imageUrl: item.imageUrl,
        price: item.price,
        salePrice: item.salePrice,
      },
    }));

    const result = await addItems(entries, false);
    // User requested: "Clear the wishlist after successful add (or keep it — decide based on UX; keeping is better)"
    // Keeping items in wishlist ensures customer doesn't lose saved items
    if (result.success) {
      showToast(
        `Added ${result.count} ${result.count === 1 ? "item" : "items"} to your cart!`,
        "success"
      );
    }
  }, [items, addItems, showToast]);

  const clearWishlist = useCallback(() => {
    persistWishlist([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_WISHLIST_KEY);
      } catch {}
    }
    showToast("Wishlist cleared", "success");
  }, [persistWishlist, showToast]);

  const itemCount = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        isLoading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        addToCart,
        moveToCart,
        addAllToCart,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
