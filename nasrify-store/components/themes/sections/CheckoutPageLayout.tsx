"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionProps } from "@/lib/themes/types";
import { useCart } from "@/components/CartContext";
import Button from "../blocks/Button";

export interface CheckoutPageLayoutSettings {
  show_order_notes?: boolean;
  layout?: "single_page" | "multistep";
}

export default function CheckoutPageLayout({
  variant = "single_page",
  settings = {},
}: SectionProps<CheckoutPageLayoutSettings>) {
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    orderNotes: "",
    paymentMethod: "cod",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const showNotes = settings.show_order_notes !== false;
  const subtotal = cart?.total || 149.0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const grandTotal = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderComplete(true);
    }, 1200);
  };

  if (orderComplete) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto font-[family-name:var(--theme-font-body)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl">
          ✓
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-sm text-[var(--theme-text-muted,#71717A)]">
          An order confirmation email has been dispatched with tracking details.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="primary" size="md">
              Return to Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-8 font-[family-name:var(--theme-font-body)]">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)] mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Shipping & Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] bg-white space-y-4">
            <h2 className="text-base font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
              Contact & Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)]"
                />
              </div>
              <div>
                <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)]"
                />
              </div>
              <div>
                <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)]"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">Delivery Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)]"
                />
              </div>
              <div>
                <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)]"
                />
              </div>
            </div>

            {showNotes && (
              <div className="text-xs pt-2">
                <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">Order Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.orderNotes}
                  onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  className="w-full px-3 py-2 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)]"
                />
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="p-6 border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] bg-white space-y-3">
            <h2 className="text-base font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
              Payment Method
            </h2>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded border border-[var(--theme-border,#E4E4E7)] cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={() => setFormData({ ...formData, paymentMethod: "cod" })}
                  className="accent-[var(--theme-primary,#25D366)]"
                />
                <div>
                  <span className="font-semibold text-[var(--theme-text,#18181B)]">Cash on Delivery (COD)</span>
                  <p className="text-[11px] text-[var(--theme-text-muted,#71717A)]">Pay with cash upon package receipt</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded border border-[var(--theme-border,#E4E4E7)] cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === "card"}
                  onChange={() => setFormData({ ...formData, paymentMethod: "card" })}
                  className="accent-[var(--theme-primary,#25D366)]"
                />
                <div>
                  <span className="font-semibold text-[var(--theme-text,#18181B)]">Online Card / Stripe</span>
                  <p className="text-[11px] text-[var(--theme-text-muted,#71717A)]">Safe & encrypted card processing</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div
          style={{ borderRadius: "var(--theme-radius, 8px)" }}
          className="lg:col-span-5 p-6 border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] space-y-4"
        >
          <h2 className="text-base font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            Order Review
          </h2>

          <div className="space-y-2 text-xs text-[var(--theme-text-muted,#71717A)]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[var(--theme-text,#18181B)]">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-[var(--theme-text,#18181B)]">
                {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 border-t border-[var(--theme-border,#E4E4E7)] flex justify-between text-sm font-extrabold text-[var(--theme-text,#18181B)]">
              <span>Total Due</span>
              <span className="text-[var(--theme-primary,#25D366)]">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Placing Order..." : "Place Order Now"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
