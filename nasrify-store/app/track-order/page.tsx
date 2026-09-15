"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import OrderStatusTimeline, { OrderTimelineData } from "@/components/OrderStatusTimeline";

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface FullTrackedOrder extends OrderTimelineData {
  customerName: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  subtotal: number;
  shipping: number;
  discountAmount: number;
  discountCode?: string | null;
  total: number;
  paymentMethod: string;
  items?: OrderItem[];
}

function TrackOrderContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || searchParams.get("orderId") || "";

  const [searchQuery, setSearchQuery] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<FullTrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchOrder = async (query: string) => {
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
      const res = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as any;

      if (!res.ok || !data.success || !data.data) {
        setError(data.error || "Order not found. Please verify your details and try again.");
      } else {
        setOrder(data.data);
      }
    } catch (err) {
      console.error("Order tracking error:", err);
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
    fetchOrder(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-purple-50/30 dark:from-[#1E0230] dark:via-[#130122] dark:to-[#0D0117] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 text-xs font-bold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-[#960DF2] animate-ping" />
            <span>Public Order Tracking</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#3C0561] dark:text-white">
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-purple-200/70 max-w-xl mx-auto">
            Check the live fulfillment status and dispatch progression of your shipment. No account login required.
          </p>
        </div>

        {/* Tracking Search Input Card */}
        <div className="rounded-3xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-[#1E0230] p-6 sm:p-8 shadow-xl shadow-purple-500/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="order-query-input"
              className="block text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200"
            >
              Order ID or Courier Tracking Number
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="order-query-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. APX-9F3B1A2C or full Order ID"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-purple-200 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-950/40 text-[#3C0561] dark:text-white placeholder-purple-300 dark:placeholder-purple-600 focus:outline-none focus:ring-2 focus:ring-[#960DF2] focus:border-transparent text-sm font-medium transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#960DF2] to-[#AB3DF5] hover:from-[#780AC2] hover:to-[#960DF2] text-white text-sm font-black tracking-wide shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Track Order</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-purple-300/60 pt-1">
              Tip: You can search by full order UUID, short confirmation code (e.g. <code>#APX-XXXXXXXX</code>), or courier tracking number.
            </p>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-5 flex items-start gap-3.5 text-red-700 dark:text-red-300">
            <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-bold">Order Lookup Failed</h4>
              <p className="text-xs mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Order Details & Timeline Section */}
        {order && (
          <div className="space-y-6">
            {/* Overview Summary Card */}
            <div className="rounded-3xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-[#1E0230] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-800/40 pb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 block">
                    Order Reference
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#3C0561] dark:text-white mt-0.5">
                    #APX-{order.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-purple-300/70 mt-1">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 block">
                    Total Amount
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-[#960DF2] dark:text-[#EACFFC] mt-0.5">
                    Rs. {Number(order.total || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-zinc-500 dark:text-purple-300/70 bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
                    Payment: {order.paymentMethod ? order.paymentMethod.toUpperCase() : "COD"}
                  </span>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 block">
                    Recipient
                  </span>
                  <p className="font-bold text-[#3C0561] dark:text-white mt-0.5">{order.customerName}</p>
                  <p className="text-zinc-500 dark:text-purple-300/80">{order.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 block">
                    Shipping Destination
                  </span>
                  <p className="font-bold text-[#3C0561] dark:text-white mt-0.5">{order.city}</p>
                  <p className="text-zinc-500 dark:text-purple-300/80">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Visual Timeline Component */}
            <OrderStatusTimeline order={order} />

            {/* Ordered Items List */}
            {order.items && order.items.length > 0 && (
              <div className="rounded-3xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-[#1E0230] p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800/40 pb-4">
                  <h3 className="text-base font-black text-[#3C0561] dark:text-white">
                    Package Items ({order.items.length})
                  </h3>
                  <span className="text-xs text-zinc-500 dark:text-purple-300/70 font-semibold">
                    Standard Fulfillment
                  </span>
                </div>

                <div className="divide-y divide-purple-100 dark:divide-purple-800/40">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-[#3C0561] dark:text-white">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-[11px] text-zinc-500 dark:text-purple-300/70">
                            Variant: {item.variantName}
                          </p>
                        )}
                        <p className="text-zinc-500 dark:text-purple-300/70 mt-0.5">
                          Qty: {item.quantity} × Rs. {Number(item.unitPrice).toFixed(2)}
                        </p>
                      </div>

                      <div className="font-bold text-[#3C0561] dark:text-white text-right">
                        Rs. {Number(item.lineTotal).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-purple-100 dark:border-purple-800/40 space-y-1.5 text-xs text-zinc-600 dark:text-purple-200/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#3C0561] dark:text-white">
                      Rs. {Number(order.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-[#960DF2] dark:text-[#EACFFC]">
                      <span>Discount {order.discountCode ? `(${order.discountCode})` : ""}</span>
                      <span className="font-bold">-Rs. {Number(order.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-[#3C0561] dark:text-white">
                      {Number(order.shipping) === 0 ? "FREE" : `Rs. ${Number(order.shipping).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-purple-100 dark:border-purple-800/40 text-sm font-black text-[#3C0561] dark:text-white">
                    <span>Total</span>
                    <span className="text-[#960DF2] dark:text-[#EACFFC]">
                      Rs. {Number(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:text-[#960DF2] transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Continue Shopping</span>
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#1E0230] text-[#3C0561] dark:text-white hover:border-[#960DF2] transition shadow-sm"
              >
                <span>Need Help with this Order?</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-purple-50/50 dark:bg-[#1E0230]">
          <div className="h-8 w-8 rounded-full border-2 border-[#960DF2] border-t-transparent animate-spin" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
