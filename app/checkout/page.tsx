"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { normalizeImageUrl } from "@/lib/utils";

export default function CheckoutPage(): React.JSX.Element {
  const router = useRouter();
  const { cart, items, subtotal, total, isLoading, refreshCart } = useCart();

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      errors.customerName = "Please enter your full name (at least 2 characters).";
    }

    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid phone number (e.g. +1 555-0199 or 03001234567).";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      errors.address = "Please enter your complete delivery street address.";
    }

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errors.city = "Please enter your delivery city.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!items || items.length === 0) {
      setServerError("Your shopping cart is empty.");
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError(null);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          paymentMethod: "cod",
          cartSessionId: cart?.sessionId || cart?.id || undefined,
        }),
      });

      const json = (await res.json()) as {
        success: boolean;
        data?: { orderId: string };
        error?: string;
      };

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to place order. Please check your details.");
      }

      // Refresh cart context to immediately reflect cleared items
      await refreshCart();

      // Navigate to order confirmation
      const orderId = json.data?.orderId;
      if (orderId) {
        router.push(`/order-success/${orderId}`);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      setServerError(
        err instanceof Error ? err.message : "An unexpected error occurred while placing your order."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 bg-[#070d09]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#18C729]" />
        <p className="mt-4 text-xs font-mono text-white/50 tracking-wider">PREPARING SECURE CHECKOUT...</p>
      </div>
    );
  }

  // Empty cart state
  if (!items || items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center bg-[#070d09]">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 text-white/40 mb-6">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">Your Cart is Empty</h1>
        <p className="text-sm text-white/50 max-w-md mb-8">
          You don&apos;t have any products in your cart to checkout. Explore our high-performance gear to get started.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-8 py-3.5 text-sm font-bold text-black hover:brightness-110 shadow-lg shadow-[#18C729]/20 transition-all"
        >
          <span>Return to Storefront</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d09] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-white transition-colors">
            Shopping Cart
          </Link>
          <span>/</span>
          <span className="text-[#18C729] font-medium">Checkout</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Complete Your Order
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Enter your shipping details. Pay securely with Cash on Delivery when your package arrives.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold text-red-300">Order Placement Failed</p>
              <p className="text-xs text-red-200/80 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Customer & Shipping Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Contact & Delivery Information */}
            <div className="rounded-2xl border border-white/10 bg-[#0c140f] p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729] font-mono font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Delivery Details</h2>
                  <p className="text-xs text-white/50">Where should we deliver your package?</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Full Customer Name <span className="text-[#18C729]">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Johnson"
                  className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                    formErrors.customerName
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                      : "border-white/15 focus:border-[#18C729]"
                  }`}
                />
                {formErrors.customerName && (
                  <p className="mt-1 text-xs text-red-400 font-medium">{formErrors.customerName}</p>
                )}
              </div>

              {/* Phone & Email grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Phone Number <span className="text-[#18C729]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 555-0199 or 03001234567"
                    className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                      formErrors.phone
                        ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                        : "border-white/15 focus:border-[#18C729]"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-400 font-medium">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Email Address <span className="text-white/40 font-normal">(Optional for tracking)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="alex@example.com"
                    className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                      formErrors.email
                        ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                        : "border-white/15 focus:border-[#18C729]"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-400 font-medium">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Complete Street Address <span className="text-[#18C729]">*</span>
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House / Apartment #, Street name, Area or Landmark"
                  className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-colors resize-none ${
                    formErrors.address
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                      : "border-white/15 focus:border-[#18C729]"
                  }`}
                />
                {formErrors.address && (
                  <p className="mt-1 text-xs text-red-400 font-medium">{formErrors.address}</p>
                )}
              </div>

              {/* City & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    City <span className="text-[#18C729]">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. New York, London, Dubai"
                    className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                      formErrors.city
                        ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                        : "border-white/15 focus:border-[#18C729]"
                    }`}
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-xs text-red-400 font-medium">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Delivery Instructions <span className="text-white/40 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g. Leave with security guard"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method (Cash on Delivery) */}
            <div className="rounded-2xl border border-white/10 bg-[#0c140f] p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729] font-mono font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Payment Method</h2>
                  <p className="text-xs text-white/50">Select your payment preference</p>
                </div>
              </div>

              {/* Cash On Delivery Option Box */}
              <div className="relative flex items-start gap-4 rounded-xl border-2 border-[#18C729] bg-[#18C729]/10 p-4.5 cursor-pointer">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#18C729] bg-[#18C729] text-black mt-0.5 shrink-0">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>Cash on Delivery (COD)</span>
                      <span className="rounded-full bg-[#18C729]/20 px-2 py-0.5 text-[10px] font-bold text-[#18C729]">
                        Zero Prepayment
                      </span>
                    </span>
                    <span className="text-xs font-mono text-[#FEF500]">Pay at Doorstep</span>
                  </div>
                  <p className="mt-1 text-xs text-white/60 leading-relaxed">
                    Pay the total amount in cash directly to the courier agent when your package arrives at your doorstep. No online credit card or bank credentials needed.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-white/40 pt-2">
                <svg className="h-4 w-4 text-[#18C729]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Encrypted Edge Order Pipeline • Inspect parcel before receipt</span>
              </div>
            </div>
          </div>

          {/* Order Summary Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#0c140f] p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-base font-bold text-white tracking-tight">Order Summary</h2>
                <span className="text-xs font-mono text-white/50">
                  {items.length} {items.length === 1 ? "Product" : "Products"}
                </span>
              </div>

              {/* Itemized list */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={normalizeImageUrl(item.imageUrl)}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#18C729] text-[9px] font-black text-black">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.productName}</p>
                      {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                        <p className="text-[10px] text-white/50 truncate">
                          {Object.values(item.variantOptions).join(" / ")}
                        </p>
                      )}
                      <p className="text-[10px] text-white/40 font-mono">
                        Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white font-mono">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Standard Shipping</span>
                  <span>
                    {cart?.shipping === 0 ? (
                      <span className="font-bold text-[#18C729]">FREE</span>
                    ) : (
                      <span className="font-mono text-white">${(cart?.shipping || 15).toFixed(2)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Payment Method</span>
                  <span className="font-semibold text-white">Cash on Delivery</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-white/10">
                  <span>Total Due</span>
                  <span className="text-xl font-mono font-black text-[#FEF500]">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] py-4 text-sm font-extrabold text-black hover:brightness-110 shadow-xl shadow-[#18C729]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order (Cash on Delivery)</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/cart"
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  ← Edit Cart Items
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
