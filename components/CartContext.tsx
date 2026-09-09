"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CartSummary, CartItemDetail } from "@/lib/cart";

interface CartContextType {
  cart: CartSummary | null;
  items: CartItemDetail[];
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (productId: string, variantId?: string | null, quantity?: number, openOnSuccess?: boolean) => Promise<boolean>;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", {
        headers: { Accept: "application/json" },
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
    async (productId: string, variantId?: string | null, quantity = 1, openOnSuccess = true) => {
      try {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, variantId, quantity }),
        });
        const json = (await res.json()) as CartApiResponse;
        if (res.ok && json.success && json.data) {
          setCart(json.data);
          if (openOnSuccess) {
            setIsDrawerOpen(true);
          }
          return true;
        } else {
          console.error("[CartContext] Error adding item:", json.error);
          return false;
        }
      } catch (err) {
        console.error("[CartContext] Network error adding item:", err);
        return false;
      }
    },
    []
  );

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      const json = (await res.json()) as CartApiResponse;
      if (res.ok && json.success && json.data) {
        setCart(json.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[CartContext] Network error updating quantity:", err);
      return false;
    }
  }, []);

  const removeItem = useCallback(async (cartItemId: string) => {
    try {
      const res = await fetch(`/api/cart/remove?cartItemId=${encodeURIComponent(cartItemId)}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as CartApiResponse;
      if (res.ok && json.success && json.data) {
        setCart(json.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[CartContext] Network error removing item:", err);
      return false;
    }
  }, []);

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
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addItem,
        updateQuantity,
        removeItem,
        refreshCart,
      }}
    >
      {children}
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
