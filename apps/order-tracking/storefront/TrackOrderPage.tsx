"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import OrderTimeline from "./OrderTimeline";
import type { TrackedOrder, OrderTrackingAppSettings } from "../shared/types";

function TrackOrderContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || searchParams.get("orderId") || "";

  const [searchQuery, setSearchQuery] = useState(initialId);
  const [contactQuery, setContactQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [settings, setSettings] = useState<Partial<OrderTrackingAppSettings> | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchOrder = async (query: string, contact?: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a valid Order ID or Tracking Number.");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    try {
      let endpoint = `/api/order-tracking/track?id=${encodeURIComponent(trimmed)}`;
      if (contact && contact.trim()) {
        endpoint += `&contact=${encodeURIComponent(contact.trim())}`;
      }

      let res = await fetch(endpoint);
      let data = (await res.json()) as any;

      if (!res.ok || !data.success || !data.data) {
        // Fallback to legacy orders endpoint
        const fallbackRes = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`);
        if (fallbackRes.ok) {
          const fallbackData = (await fallbackRes.json()) as any;
          if (fallbackData.success && fallbackData.data) {
            setOrder(fallbackData.data);
            return;
          }
        }
        setError(data.error || "Order not found. Please check your order details and try again.");
      } else {
        setOrder(data.data);
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch {
      setError("Unable to retrieve order details right now. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchQuery, contactQuery);
  };

  return (
    <div
      data-app="order-tracking"
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)] text-[var(--theme-text,#18181B)] text-xs font-bold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-[var(--theme-primary,#25D366)] animate-ping" />
            <span>Live Order Tracking</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-[var(--theme-text-muted,#71717A)] max-w-xl mx-auto">
            Check the live fulfillment status and dispatch progression of your shipment. No login required.
          </p>
        </div>

        {/* Tracking Search Input Card */}
        <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="order-query-input"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--theme-text,#18181B)] mb-1"
                >
                  Order ID or Courier Tracking #
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--theme-text-muted,#71717A)]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="order-query-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. 7f98b1a2 or APX-1234 or TRK-987"
                    className="w-full rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white pl-11 pr-4 py-2.5 text-sm text-[var(--theme-text,#18181B)] placeholder-zinc-400 focus:border-[var(--theme-primary,#25D366)] focus:outline-none font-mono transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="order-contact-input"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--theme-text,#18181B)] mb-1"
                >
                  Phone / Email (Optional)
                </label>
                <input
                  id="order-contact-input"
                  type="text"
                  value={contactQuery}
                  onChange={(e) => setContactQuery(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white px-4 py-2.5 text-sm text-[var(--theme-text,#18181B)] placeholder-zinc-400 focus:border-[var(--theme-primary,#25D366)] focus:outline-none transition"
                />
              </div>
            </div>

            <button
              id="track-submit-button"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--theme-primary,#25D366)] hover:brightness-95 active:scale-[0.98] text-white font-extrabold text-sm py-3.5 shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Searching Tracking Network...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Track Shipment Status</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 flex items-center gap-2.5">
              <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Order Timeline */}
        {order && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <OrderTimeline order={order} settings={settings || undefined} />

            {/* Order Details & Summary Card */}
            <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--theme-border,#E4E4E7)] pb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-primary,#25D366)] block">
                    Shipment Summary
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[var(--theme-text,#18181B)] mt-0.5 font-[family-name:var(--theme-font-heading)]">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] block">
                    Total Amount
                  </span>
                  <p className="text-lg font-black text-[var(--theme-primary,#25D366)] font-mono">
                    ${Number(order.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Items List */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text,#18181B)] block">
                    Package Items ({order.items.length})
                  </span>
                  <div className="divide-y divide-[var(--theme-border,#E4E4E7)]">
                    {order.items.map((it) => (
                      <div key={it.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                        <div className="pr-4">
                          <p className="font-bold text-[var(--theme-text,#18181B)]">
                            {it.productName}
                          </p>
                          {it.variantName && (
                            <p className="text-[11px] text-[var(--theme-text-muted,#71717A)] mt-0.5">
                              Variant: {it.variantName}
                            </p>
                          )}
                          <p className="text-[11px] font-mono text-[var(--theme-primary,#25D366)] mt-0.5">
                            Qty: {it.quantity} × ${Number(it.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <span className="font-bold text-[var(--theme-text,#18181B)] font-mono">
                          ${Number(it.lineTotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Destination Address */}
              <div className="rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-4 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] block">
                  Delivery Destination
                </span>
                <p className="font-bold text-[var(--theme-text,#18181B)]">
                  {order.customerName} ({order.city})
                </p>
                <p className="text-[var(--theme-text-muted,#71717A)]">
                  {order.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Helpful links */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="text-xs font-bold text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-primary,#25D366)] transition inline-flex items-center gap-1.5"
          >
            <span>← Return to Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--theme-primary,#25D366)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
