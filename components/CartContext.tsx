"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CartSummary, CartItemDetail } from "@/lib/cart";

export interface AddItemOptions {
  productName?: string;
  productSlug?: string;
  imageUrl?: string | null;
  price?: number;
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
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartApiResponse {
  success: boolean;
  data?: CartSummary;
  error?: string;
}

function recomputeCartSummary(items: CartItemDetail[], existingCart: CartSummary | null): CartSummary {
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const freeShippingThreshold = existingCart?.freeShippingThreshold || 100;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const shipping = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : (existingCart?.shipping ?? 15);
  const total = subtotal + shipping;

  return {
    id: existingCart?.id || "optimistic-cart",
    userId: existingCart?.userId || null,
    sessionId: existingCart?.sessionId || null,
    items,
    itemCount,
    subtotal,
    shipping,
    freeShippingThreshold,
    freeShippingRemaining,
    total,
  };
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
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<CartToastState | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2500);
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const json = (await res.json()) as CartApiResponse;
        if (json.success && json.data) {
          setCart(json.data);
        }
      }
    } catch (err) {
      console.error("[CartContext] Failed to load cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const addItem = useCallback(
    async (
      productId: string,
      variantId?: string | null,
      quantity = 1,
      openOnSuccessOrOptions?: boolean | AddItemOptions
    ) => {
      const options: AddItemOptions =
        typeof openOnSuccessOrOptions === "boolean"
          ? { openOnSuccess: openOnSuccessOrOptions }
          : openOnSuccessOrOptions || {};
      const openOnSuccess = options.openOnSuccess !== false;

      // 1. Snapshot previous state for rollback
      const previousCart = cart;

      // 2. Optimistically update local cart immediately (< 5ms)
      const currentItems = cart?.items ? [...cart.items] : [];
      const existingIdx = currentItems.findIndex(
        (it) => it.productId === productId && (it.variantId || null) === (variantId || null)
      );

      if (existingIdx >= 0) {
        const existing = currentItems[existingIdx];
        const newQty = existing.quantity + quantity;
        currentItems[existingIdx] = {
          ...existing,
          quantity: newQty,
          lineTotal: Number((existing.unitPrice * newQty).toFixed(2)),
        };
      } else {
        const unitPrice = options.price || 0;
        currentItems.push({
          id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          cartId: cart?.id || "opt-cart",
          productId,
          variantId: variantId || null,
          productName: options.productName || "Product",
          productSlug: options.productSlug || "",
          sku: "",
          imageUrl: options.imageUrl || "",
          variantOptions: options.variantOptions || null,
          quantity,
          unitPrice,
          lineTotal: Number((unitPrice * quantity).toFixed(2)),
          stockQuantity: 99,
          stockStatus: "in_stock",
        });
      }

      const optimisticCart = recomputeCartSummary(currentItems, cart);
      setCart(optimisticCart);
      showToast("Added to cart", "success");

      if (openOnSuccess) {
        setIsDrawerOpen(true);
      }

      // 3. Dispatch background network request
      try {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId, variantId, quantity }),
        });
        const json = (await res.json()) as CartApiResponse;
        if (res.ok && json.success && json.data) {
          setCart(json.data);
          return true;
        } else {
          // Revert on error
          console.error("[CartContext] Server rejected add:", json.error);
          setCart(previousCart);
          showToast("Failed to add item. Please try again.", "error");
          return false;
        }
      } catch (err) {
        // Revert on network failure
        console.error("[CartContext] Network error adding item:", err);
        setCart(previousCart);
        showToast("Failed to add item. Please try again.", "error");
        return false;
      }
    },
    [cart, showToast]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      const previousCart = cart;

      const currentItems = cart?.items
        ? cart.items
            .map((it) => {
              if (it.id === cartItemId) {
                if (quantity <= 0) return null;
                return {
                  ...it,
                  quantity,
                  lineTotal: Number((it.unitPrice * quantity).toFixed(2)),
                };
              }
              return it;
            })
            .filter((it): it is CartItemDetail => it !== null)
        : [];

      const optimisticCart = recomputeCartSummary(currentItems, cart);
      setCart(optimisticCart);

      try {
        const res = await fetch("/api/cart/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ cartItemId, quantity }),
        });
        const json = (await res.json()) as CartApiResponse;
        if (res.ok && json.success && json.data) {
          setCart(json.data);
          return true;
        } else {
          setCart(previousCart);
          showToast("Failed to update cart. Please try again.", "error");
          return false;
        }
      } catch (err) {
        setCart(previousCart);
        showToast("Failed to update cart. Please try again.", "error");
        return false;
      }
    },
    [cart, showToast]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      const previousCart = cart;

      const currentItems = cart?.items
        ? cart.items.filter((it) => it.id !== cartItemId)
        : [];

      const optimisticCart = recomputeCartSummary(currentItems, cart);
      setCart(optimisticCart);

      try {
        const res = await fetch(`/api/cart/remove?cartItemId=${encodeURIComponent(cartItemId)}`, {
          method: "DELETE",
          credentials: "include",
        });
        const json = (await res.json()) as CartApiResponse;
        if (res.ok && json.success && json.data) {
          setCart(json.data);
          return true;
        } else {
          setCart(previousCart);
          showToast("Failed to remove item. Please try again.", "error");
          return false;
        }
      } catch (err) {
        setCart(previousCart);
        showToast("Failed to remove item. Please try again.", "error");
        return false;
      }
    },
    [cart, showToast]
  );

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;
  const total = cart?.total || 0;

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

