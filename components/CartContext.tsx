"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { CartSummary, CartItemDetail } from "@/lib/cart";

export const LOCAL_STORAGE_CART_KEY = "apex_cart_v1";

export interface StoredCartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  imageUrl: string;
  stockQuantity: number; // snapshot for soft check
  options: Record<string, string> | null;
}

export interface StoredCart {
  items: StoredCartItem[];
  updatedAt: string;
}

export interface AddItemOptions {
  productName?: string;
  productSlug?: string;
  imageUrl?: string | null;
  price?: number;
  salePrice?: number | null;
  stockQuantity?: number;
  variantOptions?: Record<string, string> | null;
  openOnSuccess?: boolean;
}

export interface CartToastState {
  id: number;
  message: string;
  type: "success" | "error";
}

interface CartContextType {
  cart: CartSummary | null;
  items: CartItemDetail[];
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  toast: CartToastState | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  showToast: (message: string, type?: "success" | "error") => void;
  addItem: (
    productId: string,
    variantId?: string | null,
    quantity?: number,
    openOnSuccessOrOptions?: boolean | AddItemOptions
  ) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: string) => Promise<boolean>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function buildCartItemDetail(item: StoredCartItem): CartItemDetail {
  const effectivePrice = Number(item.salePrice ?? item.price);
  const lineTotal = Number((effectivePrice * item.quantity).toFixed(2));
  const id = `${item.productId}_${item.variantId || "default"}`;

  return {
    id,
    cartId: LOCAL_STORAGE_CART_KEY,
    productId: item.productId,
    variantId: item.variantId,
    productName: item.name,
    productSlug: item.slug,
    sku: item.variantId ? item.variantId.slice(0, 8).toUpperCase() : "",
    imageUrl: item.imageUrl || "",
    variantOptions: item.options,
    quantity: item.quantity,
    unitPrice: effectivePrice,
    lineTotal,
    stockQuantity: item.stockQuantity,
    stockStatus: item.stockQuantity > 0 ? "in_stock" : "out_of_stock",
  };
}

function computeCartSummary(storedItems: StoredCartItem[]): {
  cart: CartSummary;
  items: CartItemDetail[];
  itemCount: number;
  subtotal: number;
  total: number;
} {
  const items = storedItems.map(buildCartItemDetail);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = Number(
    items.reduce((acc, item) => acc + item.lineTotal, 0).toFixed(2)
  );
  const freeShippingThreshold = 100;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const shipping =
    subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 15;
  const total = Number((subtotal + shipping).toFixed(2));

  const cart: CartSummary = {
    id: LOCAL_STORAGE_CART_KEY,
    userId: null,
    sessionId: null,
    items,
    itemCount,
    subtotal,
    shipping,
    freeShippingThreshold,
    freeShippingRemaining,
    total,
  };

  return { cart, items, itemCount, subtotal, total };
}

/**
 * Fire-and-forget silent background sync for analytics and abandoned cart recovery.
 * Never throws, never blocks the UI, never presents errors to the shopper.
 */
function silentBackgroundSync(items: StoredCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredCart = {
      items,
      updatedAt: new Date().toISOString(),
    };
    fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Non-blocking catch
  }
}

function CartToastNotification({
  toast,
  onClose,
}: {
  toast: CartToastState | null;
  onClose: () => void;
}): React.JSX.Element | null {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <aside
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[100] max-w-sm pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md border ${
          isSuccess
            ? "border-[#18C729]/30 bg-[#0a150e]/95 text-white shadow-[#18C729]/10"
            : "border-red-500/30 bg-[#1c0c0c]/95 text-red-100 shadow-red-500/10"
        }`}
      >
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
            isSuccess ? "bg-[#18C729]/20 text-[#18C729]" : "bg-red-500/20 text-red-400"
          }`}
        >
          {isSuccess ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 text-xs font-semibold">{toast.message}</div>

        <button
          type="button"
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors p-1"
          aria-label="Dismiss notification"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [storedItems, setStoredItems] = useState<StoredCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<CartToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = Date.now();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, 2500);
    },
    []
  );

  // Synchronous, instant hydration from localStorage on mount (0ms cold-start)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredCart;
          if (parsed && Array.isArray(parsed.items)) {
            setStoredItems(parsed.items);
          }
        }
      }
    } catch (err) {
      console.warn("[CartContext] LocalStorage read unavailable:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to persist to localStorage synchronously
  const persistItems = useCallback((items: StoredCartItem[]) => {
    setStoredItems(items);
    if (typeof window !== "undefined") {
      try {
        const payload: StoredCart = {
          items,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn("[CartContext] LocalStorage write error:", err);
      }
    }
    silentBackgroundSync(items);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const clearCart = useCallback(() => {
    persistItems([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
      } catch {}
    }
  }, [persistItems]);

  const refreshCart = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredCart;
        if (Array.isArray(parsed?.items)) {
          setStoredItems(parsed.items);
        }
      } else {
        setStoredItems([]);
      }
    } catch {}
  }, []);

  const addItem = useCallback(
    async (
      productId: string,
      variantId?: string | null,
      quantity = 1,
      openOnSuccessOrOptions?: boolean | AddItemOptions
    ): Promise<boolean> => {
      const options: AddItemOptions =
        typeof openOnSuccessOrOptions === "boolean"
          ? { openOnSuccess: openOnSuccessOrOptions }
          : openOnSuccessOrOptions || {};
      const openOnSuccess = options.openOnSuccess !== false;

      const snapshotStock = options.stockQuantity ?? 99;

      // PART 2: Client-side Soft Stock Check
      if (snapshotStock <= 0) {
        showToast("This item is currently out of stock.", "error");
        return false;
      }

      const normalizedVariantId = variantId || null;
      const existingIdx = storedItems.findIndex(
        (it) =>
          it.productId === productId &&
          (it.variantId || null) === normalizedVariantId
      );

      let newItems: StoredCartItem[];

      if (existingIdx >= 0) {
        const existing = storedItems[existingIdx];
        const newQty = existing.quantity + quantity;

        // Soft stock check against item limit
        const limit = Math.min(existing.stockQuantity || 99, snapshotStock);
        if (newQty > limit) {
          showToast(`Only ${limit} units available in stock.`, "error");
          return false;
        }

        newItems = [...storedItems];
        newItems[existingIdx] = {
          ...existing,
          quantity: newQty,
          stockQuantity: snapshotStock,
          price: options.price !== undefined ? options.price : existing.price,
          salePrice:
            options.salePrice !== undefined
              ? options.salePrice
              : existing.salePrice,
        };
      } else {
        if (quantity > snapshotStock) {
          showToast(`Only ${snapshotStock} units available in stock.`, "error");
          return false;
        }

        const newItem: StoredCartItem = {
          productId,
          variantId: normalizedVariantId,
          quantity,
          name: options.productName || "Product",
          slug: options.productSlug || "",
          price: options.price ?? 0,
          salePrice: options.salePrice ?? null,
          imageUrl: options.imageUrl || "",
          stockQuantity: snapshotStock,
          options: options.variantOptions || null,
        };
        newItems = [...storedItems, newItem];
      }

      // Synchronous instant update (0ms, zero D1 hits)
      persistItems(newItems);
      showToast("Added to cart", "success");

      if (openOnSuccess) {
        setIsDrawerOpen(true);
      }

      return true;
    },
    [storedItems, showToast, persistItems]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number): Promise<boolean> => {
      let newItems: StoredCartItem[];

      if (quantity <= 0) {
        newItems = storedItems.filter(
          (it) => `${it.productId}_${it.variantId || "default"}` !== cartItemId
        );
      } else {
        newItems = storedItems.map((it) => {
          const itemId = `${it.productId}_${it.variantId || "default"}`;
          if (itemId === cartItemId) {
            // Soft stock check
            if (it.stockQuantity > 0 && quantity > it.stockQuantity) {
              showToast(`Only ${it.stockQuantity} available in stock.`, "error");
              return it;
            }
            return {
              ...it,
              quantity,
            };
          }
          return it;
        });
      }

      persistItems(newItems);
      return true;
    },
    [storedItems, showToast, persistItems]
  );

  const removeItem = useCallback(
    async (cartItemId: string): Promise<boolean> => {
      const newItems = storedItems.filter(
        (it) => `${it.productId}_${it.variantId || "default"}` !== cartItemId
      );
      persistItems(newItems);
      return true;
    },
    [storedItems, persistItems]
  );

  const { cart, items, itemCount, subtotal, total } = useMemo(
    () => computeCartSummary(storedItems),
    [storedItems]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        total,
        isLoading,
        isDrawerOpen,
        toast,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        showToast,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
      <CartToastNotification toast={toast} onClose={() => setToast(null)} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
