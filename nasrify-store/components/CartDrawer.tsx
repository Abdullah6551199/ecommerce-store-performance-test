"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { normalizeImageUrl } from "@/lib/utils";
import CouponsSection from "./CouponsSection";
import Button from "@/components/themes/blocks/Button";

interface CartDrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Isolated Memoized Outer Panel (Portal + CSS Containment)
 * Decouples the drawer from the React tree by rendering directly into document.body.
 * Animation is 100% CSS-driven with hardware acceleration and layout isolation
 * (contain: layout style paint), preventing any bounce when products are added.
 */
const CartDrawerPanel = memo(function CartDrawerPanel({
  isOpen,
  onClose,
  children,
}: CartDrawerPanelProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside drawer to close smoothly without blocking page interactions
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={drawerRef}
      id="cart-drawer-panel"
      aria-label="Shopping Cart Drawer"
      aria-hidden={!isOpen}
      className={`cart-drawer-panel bg-white text-[var(--theme-text,#18181B)] border-l border-[var(--theme-border,#E4E4E7)] shadow-2xl flex flex-col justify-between z-50 font-[family-name:var(--theme-font-body)] ${
        isOpen ? "open drawer-open" : "drawer-closed"
      }`}
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        visibility: isOpen ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    document.body
  );
});

export default function CartDrawer(): React.JSX.Element {
  const {
    cart,
    items,
    itemCount,
    subtotal,
    total,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    appliedCoupon,
    discountAmount,
    freeShippingCoupon,
  } = useCart();

  const freeShippingThreshold = cart?.freeShippingThreshold || 100;
  const freeShippingRemaining =
    cart?.freeShippingRemaining ?? Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <CartDrawerPanel isOpen={isDrawerOpen} onClose={closeDrawer}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--theme-primary-light,#DCFCE7)] text-[var(--theme-accent,#18181B)]">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-xs font-extrabold text-[var(--theme-text,#18181B)] tracking-tight flex items-center gap-1.5 font-[family-name:var(--theme-font-heading)]">
            <span>Your Cart</span>
            <span className="rounded-full bg-[var(--theme-primary-light,#DCFCE7)] px-2 py-0.2 text-[9px] font-mono font-bold text-[var(--theme-accent,#18181B)]">
              {itemCount}
            </span>
          </h2>
        </div>

        <button
          type="button"
          onClick={closeDrawer}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--theme-border,#E4E4E7)] text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] hover:bg-zinc-100 transition-colors"
          aria-label="Close cart drawer"
          title="Close Cart"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="px-4 py-2.5 bg-zinc-50 border-b border-[var(--theme-border,#E4E4E7)] shrink-0">
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          {freeShippingRemaining > 0 ? (
            <span className="text-[var(--theme-text,#18181B)]">
              Add <strong className="text-[var(--theme-primary,#25D366)] font-bold">${freeShippingRemaining.toFixed(2)}</strong> for{" "}
              <strong className="text-[var(--theme-accent,#18181B)] font-bold">FREE Shipping</strong>
            </span>
          ) : (
            <span className="text-[var(--theme-primary,#25D366)] font-bold flex items-center gap-1">
              ✓ FREE Delivery Unlocked!
            </span>
          )}
          <span className="text-[9px] font-mono text-[var(--theme-text-muted,#71717A)] font-semibold">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full bg-[var(--theme-primary,#25D366)] transition-[width] duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 min-h-[180px] overflow-y-scroll px-3 py-2 space-y-2 [scrollbar-gutter:stable]">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)] mb-2">
              <svg
                className="h-6 w-6 text-[var(--theme-text-muted,#71717A)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-[var(--theme-text,#18181B)] mb-0.5 font-[family-name:var(--theme-font-heading)]">Your cart is empty</h3>
            <p className="text-[11px] text-[var(--theme-text-muted,#71717A)] max-w-xs mb-3">
              Explore our catalog to add modern products.
            </p>
            <Link href="/shop" onClick={closeDrawer}>
              <Button variant="primary" size="sm">
                Browse Catalog
              </Button>
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-2.5 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white p-2 transition-colors hover:border-[var(--theme-primary,#25D366)]"
            >
              {/* Product Thumbnail (h-12 w-12) */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)]">
                <Image
                  src={normalizeImageUrl(item.imageUrl, { width: 96, quality: 75 })}
                  alt={item.productName}
                  fill
                  sizes="48px"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <Link
                      href={`/product/${item.productSlug}`}
                      onClick={closeDrawer}
                      className="text-xs font-bold text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] transition-colors truncate block"
                      title={item.productName}
                    >
                      {item.productName}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[var(--theme-text-muted,#71717A)] hover:text-red-500 p-0.5 transition-colors shrink-0 cursor-pointer"
                      title="Remove item"
                      aria-label={`Remove ${item.productName}`}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {item.bundleName && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--theme-primary-light,#DCFCE7)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--theme-accent,#18181B)]">
                        <span>Bundle:</span>
                        <span className="truncate max-w-[140px]">{item.bundleName}</span>
                      </span>
                    </div>
                  )}

                  {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {Object.entries(item.variantOptions).map(([key, val]) => (
                        <span
                          key={key}
                          className="rounded bg-[var(--theme-surface,#F4F4F5)] px-1 py-0.2 text-[9px] text-[var(--theme-text-muted,#71717A)] font-medium"
                        >
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-[var(--theme-border,#E4E4E7)]">
                  <div className="flex items-center rounded-lg border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center text-xs font-bold text-[var(--theme-text,#18181B)] hover:bg-zinc-200 rounded-l-lg transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="min-w-[20px] text-center text-[11px] font-bold text-[var(--theme-text,#18181B)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center text-xs font-bold text-[var(--theme-text,#18181B)] hover:bg-zinc-200 rounded-r-lg transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[11px] font-extrabold text-[var(--theme-text,#18181B)]">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Summary & Checkout */}
      {items.length > 0 && (
        <div className="border-t border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-3 space-y-2 shrink-0">
          {/* Simplified Drawer Coupon UI */}
          <CouponsSection compact={true} />

          {/* Compact Order Summary */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-[var(--theme-text-muted,#71717A)]">
              <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span className="font-semibold text-[var(--theme-text,#18181B)]">${subtotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-[var(--theme-primary,#25D366)] font-bold">
                <span>Discount ({appliedCoupon.code})</span>
                <span>{freeShippingCoupon ? "FREE" : `-$${discountAmount.toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex justify-between text-[var(--theme-text-muted,#71717A)]">
              <span>Shipping</span>
              <span>
                {cart?.shipping === 0 ? (
                  <strong className="text-[var(--theme-primary,#25D366)] font-bold">FREE</strong>
                ) : (
                  `$${(cart?.shipping || 15).toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-[var(--theme-text,#18181B)] pt-1 border-t border-[var(--theme-border,#E4E4E7)]">
              <span>Total</span>
              <span className="text-[var(--theme-text,#18181B)] text-sm font-extrabold">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5 pt-0.5">
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block w-full"
            >
              <Button variant="primary" size="md" className="w-full justify-center">
                <span>Proceed to Checkout</span>
                <svg className="h-3 w-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </Link>

            <Link
              href="/cart"
              onClick={closeDrawer}
              className="block w-full"
            >
              <Button variant="outline" size="sm" className="w-full justify-center">
                View Full Cart
              </Button>
            </Link>
          </div>
        </div>
      )}
    </CartDrawerPanel>
  );
}
