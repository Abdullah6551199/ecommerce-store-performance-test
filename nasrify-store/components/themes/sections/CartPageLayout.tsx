"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";
import { useCart } from "@/components/CartContext";
import Button from "../blocks/Button";
import PriceTag from "../blocks/PriceTag";

export interface CartPageLayoutSettings {
  show_coupon?: boolean;
  show_estimated_shipping?: boolean;
  layout?: "standard" | "compact";
}

export default function CartPageLayout({
  variant = "standard",
  settings = {},
}: SectionProps<CartPageLayoutSettings>) {
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const showCoupon = settings.show_coupon !== false;
  const showShipping = settings.show_estimated_shipping !== false;

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const grandTotal = Math.max(0, subtotal - discount + (showShipping ? shipping : 0));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      setCouponApplied(true);
    }
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto font-[family-name:var(--theme-font-body)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--theme-surface,#F4F4F5)] flex items-center justify-center text-2xl text-[var(--theme-text-muted,#71717A)]">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-[var(--theme-text-muted,#71717A)]">
          Looks like you haven't added anything to your cart yet.
        </p>
        <div className="mt-6">
          <Link href="/shop">
            <Button variant="primary" size="md">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-8 font-[family-name:var(--theme-font-body)]">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)] mb-8">
        Shopping Cart ({items.length})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-[var(--theme-border,#E4E4E7)] border-y border-[var(--theme-border,#E4E4E7)]">
            {items.map((item: any) => {
              const unitPrice = item.price || 0;
              const lineTotal = unitPrice * item.quantity;
              return (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <div className="relative w-20 h-20 shrink-0 rounded-[var(--theme-radius,8px)] overflow-hidden bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)]">
                    <Image
                      src={item.imageUrl || "/placeholder.png"}
                      alt={item.productName || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--theme-text,#18181B)] truncate">
                      {item.productName}
                    </h3>
                    {item.variantName && (
                      <p className="text-xs text-[var(--theme-text-muted,#71717A)]">
                        {item.variantName}
                      </p>
                    )}
                    <div className="mt-1">
                      <PriceTag price={unitPrice} size="sm" />
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-button-radius,var(--theme-radius,8px))] bg-[var(--theme-surface,#F4F4F5)] h-8 px-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-1 text-xs text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-semibold text-[var(--theme-text,#18181B)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-1 text-xs text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right font-bold text-sm text-[var(--theme-text,#18181B)] min-w-[70px]">
                    ${lineTotal.toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-[var(--theme-text-muted,#71717A)] hover:text-red-500 p-1 cursor-pointer transition-colors"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Coupon Box */}
          {showCoupon && (
            <form onSubmit={handleApplyCoupon} className="pt-4 flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Discount code (e.g. NASRIFY10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)]"
              />
              <Button type="submit" size="sm" variant="outline">
                {couponApplied ? "Applied ✓" : "Apply"}
              </Button>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div
          style={{ borderRadius: "var(--theme-radius, 8px)" }}
          className="lg:col-span-4 p-6 border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] space-y-4"
        >
          <h2 className="text-base font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            Order Summary
          </h2>

          <div className="space-y-2 text-xs text-[var(--theme-text-muted,#71717A)]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[var(--theme-text,#18181B)]">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {couponApplied && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount (10%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            {showShipping && (
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-[var(--theme-text,#18181B)]">
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-[var(--theme-border,#E4E4E7)] flex justify-between text-sm font-extrabold text-[var(--theme-text,#18181B)]">
              <span>Total</span>
              <span className="text-[var(--theme-primary,#25D366)]">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/checkout" className="block w-full">
              <Button fullWidth size="lg" variant="primary">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
