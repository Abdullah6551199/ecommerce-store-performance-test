"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { normalizeImageUrl } from "@/lib/utils";
import CouponsSection from "@/components/CouponsSection";
import TrustBar from "@/components/homepage/TrustBar";
import PaymentIcons from "@/components/PaymentIcons";
import TrustBadges from "@/components/TrustBadges";
import StorefrontCheckoutBelow from "@/components/apps/StorefrontCheckoutBelow";

const CHECKOUT_COUNTRIES = [
  { code: "PK", name: "Pakistan" },
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "BD", name: "Bangladesh" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function CheckoutPage(): React.JSX.Element {
  const router = useRouter();
  const {
    cart,
    items,
    subtotal,
    total,
    isLoading,
    clearCart,
    appliedCoupon,
    discountAmount,
    freeShippingCoupon,
  } = useCart();

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "PK",
    state: "",
    notes: "",
  });

  // Shipping & Tax Dynamic Calculations state
  interface ShippingCalcState {
    zone: any;
    shippingCost: number;
    isFree: boolean;
    deliveryTimeMin: number;
    deliveryTimeMax: number;
    shippingAvailable: boolean;
    minOrderValueMet: boolean;
    minOrderValue: number | null;
    message?: string;
  }

  interface TaxCalcState {
    isEnabled: boolean;
    taxAmount: number;
    netAmount: number;
    rate: number;
    label: string;
    taxType: "inclusive" | "exclusive";
    appliedToShipping: boolean;
  }

  const [shippingResult, setShippingResult] = useState<ShippingCalcState | null>(null);
  const [taxResult, setTaxResult] = useState<TaxCalcState | null>(null);
  const [isCalculatingRates, setIsCalculatingRates] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Customer Account & Saved Addresses state
  interface SavedAddress {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    isDefault: boolean;
  }
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("manual");
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadCustomerData() {
      try {
        const [meRes, addrRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/customer/addresses"),
        ]);

        if (meRes.ok) {
          const meData = (await meRes.json()) as {
            customer?: { id: string; name?: string; email?: string; phone?: string | null };
          };
          if (meData.customer) {
            setIsCustomerLoggedIn(true);
            setCustomerId(meData.customer.id);
            setFormData((prev) => ({
              ...prev,
              customerName: prev.customerName || meData.customer?.name || "",
              email: prev.email || meData.customer?.email || "",
              phone: prev.phone || meData.customer?.phone || "",
            }));
          }
        }

        if (addrRes.ok) {
          const addrData = (await addrRes.json()) as { addresses?: SavedAddress[] };
          const addrs: SavedAddress[] = addrData.addresses || [];
          setSavedAddresses(addrs);

          if (addrs.length > 0) {
            const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
            setSelectedAddressId(defaultAddr.id);
            setFormData((prev) => ({
              ...prev,
              customerName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              address: defaultAddr.address,
              city: defaultAddr.city,
              country: (defaultAddr as any).country === "Pakistan" ? "PK" : ((defaultAddr as any).country || prev.country),
            }));
          }
        }
      } catch {}
    }
    loadCustomerData();
  }, []);

  // Visitor Location Auto-Detection via Cloudflare request.cf / Public Tax API
  React.useEffect(() => {
    async function initVisitorLocation() {
      try {
        const res = await fetch("/api/tax/detect");
        const json = (await res.json()) as any;
        if (json.success && json.resolvedLocation?.country) {
          setFormData((prev) => {
            // Only auto-fill if user hasn't selected another country manually
            if (prev.country === "PK" && json.resolvedLocation.country !== "PK") {
              return {
                ...prev,
                country: json.resolvedLocation.country,
                state: json.resolvedLocation.state || prev.state,
                city: json.resolvedLocation.city || prev.city,
              };
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn("Visitor location detection error:", err);
      }
    }
    initVisitorLocation();
  }, []);

  // Real-time Shipping & Tax Recalculation
  React.useEffect(() => {
    let isCancelled = false;

    async function recalculateRates() {
      if (!formData.country) return;
      setIsCalculatingRates(true);

      try {
        const effectiveSubtotal = Math.max(0, subtotal - discountAmount);

        // 1. Calculate Shipping
        const shipRes = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country: formData.country,
            state: formData.state || null,
            orderSubtotal: effectiveSubtotal,
          }),
        });

        const shipJson = (await shipRes.json()) as any;
        let currentShippingCost = 0;

        if (shipJson.success && shipJson.data) {
          if (!isCancelled) setShippingResult(shipJson.data);
          currentShippingCost = shipJson.data.shippingCost;
        }

        if (freeShippingCoupon) {
          currentShippingCost = 0;
        }

        // 2. Calculate Tax
        const taxRes = await fetch("/api/tax/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: effectiveSubtotal,
            country: formData.country,
            state: formData.state || null,
            city: formData.city || null,
            shippingCost: currentShippingCost,
          }),
        });

        const taxJson = (await taxRes.json()) as any;
        if (taxJson.success && !isCancelled) {
          setTaxResult(taxJson);
        }
      } catch (err) {
        console.warn("Failed to recalculate tax and shipping:", err);
      } finally {
        if (!isCancelled) setIsCalculatingRates(false);
      }
    }

    recalculateRates();

    return () => {
      isCancelled = true;
    };
  }, [formData.country, formData.state, formData.city, subtotal, discountAmount, freeShippingCoupon]);

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === "manual") {
      setFormData((prev) => ({
        ...prev,
        address: "",
        city: "",
      }));
      return;
    }
    const found = savedAddresses.find((a) => a.id === id);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customerName: found.fullName,
        phone: found.phone,
        address: found.address,
        city: found.city,
        country: (found as any).country === "Pakistan" ? "PK" : ((found as any).country || prev.country),
      }));
    }
  };

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

    if (!formData.country || !formData.country.trim()) {
      errors.country = "Please select your delivery country.";
    }

    if (formData.country === "US" && (!formData.state || !formData.state.trim())) {
      errors.state = "Please select your state.";
    }

    if (shippingResult && !shippingResult.shippingAvailable) {
      errors.country = "Shipping is not available to this destination country.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
          customerId: customerId || undefined,
          couponCode: appliedCoupon?.code || undefined,
          paymentMethod: "cod",
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId || null,
            quantity: i.quantity,
          })),
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

      // If customer requested saving new address for future orders
      if (isCustomerLoggedIn && saveAddressForFuture && selectedAddressId === "manual") {
        fetch("/api/customer/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: "Home",
            fullName: formData.customerName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: "Pakistan",
            isDefault: savedAddresses.length === 0,
          }),
        }).catch(() => {});
      }

      // Clear client-side cart completely from localStorage and React state
      clearCart();

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-zinc-900 dark:text-purple-100">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-200 dark:border-purple-800 border-t-purple-600" />
        <p className="mt-4 text-xs font-mono text-purple-600 dark:text-purple-300 tracking-wider">PREPARING SECURE CHECKOUT...</p>
      </div>
    );
  }

  // Empty cart state
  if (!items || items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center text-zinc-900 dark:text-purple-100">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 text-purple-400 mb-6">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#3C0561] dark:text-[#EACFFC] mb-2">Your Cart is Empty</h1>
        <p className="text-sm text-purple-700/80 dark:text-purple-300/80 max-w-md mb-8">
          You don&apos;t have any products in your cart to checkout. Explore our high-performance gear to get started.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-purple-400 hover:bg-purple-500 text-white px-8 py-3.5 text-sm font-bold shadow-lg shadow-purple-500/25 transition-all"
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-purple-100">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-purple-600/70 dark:text-purple-300/70 mb-8 font-medium">
          <Link href="/" className="hover:text-purple-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-purple-900 dark:hover:text-white transition-colors">
            Shopping Cart
          </Link>
          <span>/</span>
          <span className="text-[#3C0561] dark:text-[#EACFFC] font-bold">Checkout</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3C0561] dark:text-[#EACFFC] sm:text-4xl">
            Complete Your Order
          </h1>
          <p className="mt-1 text-sm text-purple-700/80 dark:text-purple-300/80">
            Enter your shipping details. Pay securely with Cash on Delivery when your package arrives.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold text-red-800 dark:text-red-300">Order Placement Failed</p>
              <p className="text-xs text-red-700/80 dark:text-red-200/80 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Customer & Shipping Form (7 cols) - Wrapped in Big White Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-purple-100 dark:border-purple-700 bg-white dark:bg-[#3C0561] p-6 sm:p-8 shadow-lg shadow-purple-100/50 dark:shadow-purple-900/30 space-y-6">
              {/* Step 1: Contact & Delivery Information */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-purple-100 dark:border-purple-700/60 pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-mono font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#3C0561] dark:text-[#EACFFC] tracking-tight">Delivery Details</h2>
                    <p className="text-xs text-purple-600/70 dark:text-purple-300/70">Where should we deliver your package?</p>
                  </div>
                </div>

                {/* Saved Addresses Selector (for authenticated customers) */}
                {isCustomerLoggedIn && savedAddresses.length > 0 && (
                  <div className="p-3.5 rounded-2xl border border-purple-200 dark:border-purple-700 bg-purple-50/60 dark:bg-purple-900/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#3C0561] dark:text-[#EACFFC]">
                        Select Delivery Address
                      </label>
                      <Link
                        href="/account/addresses"
                        target="_blank"
                        className="text-[11px] font-bold text-purple-600 dark:text-purple-300 hover:underline"
                      >
                        Manage Addresses &rarr;
                      </Link>
                    </div>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => handleAddressSelect(e.target.value)}
                      className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    >
                      {savedAddresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} &bull; {a.fullName} - {a.address}, {a.city} {a.isDefault ? "(Default)" : ""}
                        </option>
                      ))}
                      <option value="manual">+ Enter a different delivery address</option>
                    </select>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1.5">
                    Full Customer Name <span className="text-purple-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="e.g. Alex Johnson"
                    className={`w-full rounded-xl border bg-purple-50/30 dark:bg-purple-950/40 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-purple-300/40 focus:outline-none transition-colors ${
                      formErrors.customerName
                        ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                        : "border-purple-200 dark:border-purple-700 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    }`}
                  />
                  {formErrors.customerName && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.customerName}</p>
                  )}
                </div>

                {/* Phone & Email grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1.5">
                      Phone Number <span className="text-purple-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +1 555-0199 or 03001234567"
                      className={`w-full rounded-xl border bg-purple-50/30 dark:bg-purple-950/40 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-purple-300/40 focus:outline-none transition-colors ${
                        formErrors.phone
                          ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                          : "border-purple-200 dark:border-purple-700 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1.5">
                      Email Address <span className="text-purple-600/60 dark:text-purple-300/50 font-normal">(Optional for tracking)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="alex@example.com"
                      className={`w-full rounded-xl border bg-purple-50/30 dark:bg-purple-950/40 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-purple-300/40 focus:outline-none transition-colors ${
                        formErrors.email
                          ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                          : "border-purple-200 dark:border-purple-700 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1.5">
                    Complete Street Address <span className="text-purple-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House / Apartment #, Street name, Area or Landmark"
                    className={`w-full rounded-xl border bg-purple-50/30 dark:bg-purple-950/40 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-purple-300/40 focus:outline-none transition-colors resize-none ${
                      formErrors.address
                        ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                        : "border-purple-200 dark:border-purple-700 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    }`}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.address}</p>
                  )}
                </div>

                {/* Country & State Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1.5">
                      Destination Country <span className="text-purple-500">*</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-950/40 px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-colors"
                    >
                      {CHECKOUT_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                    {formErrors.country && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.country}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1.5">
                      State / Province {formData.country === "US" ? <span className="text-purple-500">*</span> : <span className="text-purple-600/60 dark:text-purple-300/50 font-normal">(Optional)</span>}
                    </label>
                    {formData.country === "US" ? (
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl border bg-purple-50/30 dark:bg-purple-950/40 px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none transition-colors ${
                          formErrors.state
                            ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                            : "border-purple-200 dark:border-purple-700 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                        }`}
                      >
                        <option value="">Select US State</option>
                        {US_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g. Sindh, Punjab, California"
                        className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-950/40 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-colors"
                      />
                    )}
                    {formErrors.state && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.state}</p>
                    )}
                  </div>
                </div>

                {/* City & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1.5">
                      City <span className="text-purple-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Karachi, New York, London"
                      className={`w-full rounded-xl border bg-purple-50/30 dark:bg-purple-950/40 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-purple-300/40 focus:outline-none transition-colors ${
                        formErrors.city
                          ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                          : "border-purple-200 dark:border-purple-700 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                      }`}
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1.5">
                      Delivery Instructions <span className="text-purple-600/60 dark:text-purple-300/50 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="e.g. Leave with security guard"
                      className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-950/40 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Save Address Checkbox */}
                {isCustomerLoggedIn && (selectedAddressId === "manual" || savedAddresses.length === 0) && (
                  <div className="pt-2 border-t border-purple-100 dark:border-purple-700/50">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#3C0561] dark:text-purple-200 select-none">
                      <input
                        type="checkbox"
                        checked={saveAddressForFuture}
                        onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                        className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-400"
                      />
                      Save this address to my account for faster future checkouts
                    </label>
                  </div>
                )}
              </div>

              {/* Step 2: Payment Method (Cash on Delivery) */}
              <div className="space-y-4 pt-4 border-t border-purple-100 dark:border-purple-700/60">
                <div className="flex items-center gap-3 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-mono font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#3C0561] dark:text-[#EACFFC] tracking-tight">Payment Method</h2>
                    <p className="text-xs text-purple-600/70 dark:text-purple-300/70">Select your payment preference</p>
                  </div>
                </div>

                {/* Cash On Delivery Option Box - Purple theme */}
                <div className="relative flex items-start gap-4 rounded-xl border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/20 p-4.5 cursor-pointer">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-purple-500 bg-purple-500 text-white mt-0.5 shrink-0">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-[#3C0561] dark:text-white flex items-center gap-2">
                        <span>Cash on Delivery (COD)</span>
                        <span className="rounded-full bg-purple-100 dark:bg-purple-800 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-200">
                          Zero Prepayment
                        </span>
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-300">Pay at Doorstep</span>
                    </div>
                    <p className="mt-1 text-xs text-purple-800/80 dark:text-purple-200/80 leading-relaxed">
                      Pay the total amount in cash directly to the courier agent when your package arrives at your doorstep. No online credit card or bank credentials needed.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-purple-600 dark:text-purple-300 pt-2 font-medium">
                  <svg className="h-4 w-4 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Encrypted 256-bit Secure Checkout • Inspect parcel before receipt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-purple-100 dark:border-purple-700 bg-white dark:bg-[#3C0561] p-6 shadow-lg shadow-purple-100/50 dark:shadow-purple-900/30 space-y-6">
              <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-700/60 pb-4">
                <h2 className="text-base font-bold text-[#3C0561] dark:text-[#EACFFC] tracking-tight">Order Summary</h2>
                <span className="text-xs font-mono text-purple-600 dark:text-purple-300 font-semibold">
                  {items.length} {items.length === 1 ? "Product" : "Products"}
                </span>
              </div>

              {/* Itemized list */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-purple-100 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/50">
                      <Image
                        src={normalizeImageUrl(item.imageUrl, { width: 112, quality: 75 })}
                        alt={item.productName}
                        fill
                        sizes="56px"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-black text-white z-10">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#3C0561] dark:text-white truncate">{item.productName}</p>
                      {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                        <p className="text-[10px] text-purple-600/70 dark:text-purple-300/70 truncate">
                          {Object.values(item.variantOptions).join(" / ")}
                        </p>
                      )}
                      <p className="text-[10px] text-purple-600/60 dark:text-purple-300/60 font-mono">
                        Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#3C0561] dark:text-white font-mono">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupons & Discounts Promo Section */}
              <div className="pt-2 border-t border-purple-100 dark:border-purple-700/60">
                <CouponsSection />
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-purple-100 dark:border-purple-700/60 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-purple-700/80 dark:text-purple-200/80">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#3C0561] dark:text-white font-mono">${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-purple-600 dark:text-purple-400 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>
                      {freeShippingCoupon
                        ? "FREE SHIPPING"
                        : `-$${discountAmount.toFixed(2)}`}
                    </span>
                  </div>
                )}

                {/* Dynamic Shipping Line */}
                <div className="flex justify-between text-purple-700/80 dark:text-purple-200/80">
                  <div className="flex items-center gap-1.5">
                    <span>Shipping</span>
                    {shippingResult?.zone && (
                      <span className="text-[10px] text-purple-600/70 dark:text-purple-300/70 font-mono">
                        ({shippingResult.deliveryTimeMin}-{shippingResult.deliveryTimeMax} days)
                      </span>
                    )}
                  </div>
                  <span>
                    {!shippingResult?.shippingAvailable ? (
                      <span className="font-bold text-red-500">Unavailable</span>
                    ) : shippingResult?.isFree || freeShippingCoupon ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                        FREE
                      </span>
                    ) : (
                      <span className="font-mono text-[#3C0561] dark:text-white">
                        ${(shippingResult?.shippingCost ?? 15).toFixed(2)}
                      </span>
                    )}
                  </span>
                </div>

                {/* Dynamic Tax Line */}
                {taxResult && taxResult.isEnabled && (taxResult.rate > 0 || taxResult.taxAmount > 0) && (
                  <div className="flex justify-between text-purple-700/80 dark:text-purple-200/80">
                    <span>
                      {taxResult.taxType === "inclusive"
                        ? `Tax Included (${taxResult.label} ${taxResult.rate}%)`
                        : `Tax (${taxResult.label} ${taxResult.rate}%)`}
                    </span>
                    <span className="font-mono text-[#3C0561] dark:text-white font-semibold">
                      ${taxResult.taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-purple-700/80 dark:text-purple-200/80">
                  <span>Payment Method</span>
                  <span className="font-semibold text-[#3C0561] dark:text-white">Cash on Delivery</span>
                </div>

                {/* Total Due */}
                {(() => {
                  const effectiveShipCost = shippingResult?.shippingAvailable
                    ? (shippingResult.isFree || freeShippingCoupon ? 0 : shippingResult.shippingCost)
                    : 0;

                  const effectiveTax =
                    taxResult && taxResult.isEnabled && taxResult.taxType === "exclusive"
                      ? taxResult.taxAmount
                      : 0;

                  const finalTotal = Math.max(
                    0,
                    Math.round((subtotal - discountAmount + effectiveShipCost + effectiveTax) * 100) / 100
                  );

                  return (
                    <div className="flex justify-between text-base font-extrabold text-[#3C0561] dark:text-[#EACFFC] pt-3 border-t border-purple-100 dark:border-purple-700/60">
                      <span>Total Due</span>
                      <span className="text-xl font-mono font-black text-purple-600 dark:text-purple-300">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Shipping Unavailable Warning */}
              {shippingResult && !shippingResult.shippingAvailable && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300 font-bold flex items-start gap-2">
                  <svg className="h-4 w-4 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Shipping is not available to this location. Please choose an alternate address or country.</span>
                </div>
              )}

              {/* Submit Button - PURPLE */}
              <button
                type="submit"
                disabled={isSubmitting || (shippingResult !== null && !shippingResult.shippingAvailable) || isCalculatingRates}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-400 hover:bg-purple-500 text-white dark:bg-purple-500 dark:hover:bg-purple-400 py-4 text-sm font-extrabold shadow-xl shadow-purple-400/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Placing Your Order...</span>
                  </>
                ) : isCalculatingRates ? (
                  <span>Updating Rates...</span>
                ) : shippingResult !== null && !shippingResult.shippingAvailable ? (
                  <span>Shipping Unavailable</span>
                ) : (
                  <>
                    <span>Place Order (Cash on Delivery)</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              <StorefrontCheckoutBelow />

              {/* Stage 22 Part A: Payment Icons Row & Trust Badges near Place Order */}
              <div className="pt-2 space-y-3 border-t border-purple-100 dark:border-purple-800/60">
                <div className="flex flex-col items-center justify-center gap-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-purple-300/60 tracking-wider">
                    Accepted Payment Options
                  </span>
                  <PaymentIcons className="flex flex-wrap items-center justify-center gap-2 pt-1" />
                </div>
                <TrustBadges location="checkout" limit={4} variant="compact" />
              </div>

              <div className="text-center">
                <Link
                  href="/cart"
                  className="text-xs text-purple-600/70 dark:text-purple-300/70 hover:text-[#3C0561] dark:hover:text-white transition-colors"
                >
                  ← Edit Cart Items
                </Link>
              </div>
            </div>
          </div>
        </form>

        {/* Store Trust Bar */}
        <div className="mt-12">
          <TrustBar />
        </div>
      </div>
    </div>
  );
}
