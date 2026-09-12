"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { OrderWithItems } from "@/lib/orders";

export default function OrderSuccessPage(): React.JSX.Element {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
      })
      .catch(() => {});

    if (!orderId) return;

    async function fetchOrder() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        const json = (await res.json()) as {
          success: boolean;
          data?: OrderWithItems;
          error?: string;
        };
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || "Order not found");
        }
        setOrder(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const copyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-4 text-zinc-900 dark:text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 dark:border-white/20 border-t-[#18C729]" />
        <p className="mt-4 text-xs font-mono text-zinc-500 dark:text-white/50 tracking-wider">RETRIEVING ORDER RECEIPT...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center text-zinc-900 dark:text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mb-4 border border-red-500/20">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Order Not Found</h1>
        <p className="text-xs text-zinc-500 dark:text-white/50 max-w-sm mb-6">
          {error || "We couldn't locate the specified order reference."}
        </p>
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-6 py-2.5 text-xs font-bold text-black hover:brightness-110 transition-all shadow-lg shadow-[#18C729]/20"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Celebration Banner */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#18C729]/15 border border-[#18C729]/30 text-[#18C729] shadow-2xl shadow-[#18C729]/20 animate-bounce">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <span className="inline-block rounded-full bg-[#18C729]/10 border border-[#18C729]/20 px-3 py-1 text-[11px] font-mono font-bold text-[#18C729] uppercase tracking-wider mb-2">
              Order Confirmed &bull; Cash on Delivery
            </span>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Thank You For Your Order!
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-white/60">
              We have received your order and our fulfillment team is preparing your package for dispatch.
            </p>
          </div>

          {/* Order ID bar */}
          <div className="inline-flex items-center gap-3 rounded-2xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0c140f] px-5 py-2.5 shadow-xl">
            <span className="text-xs text-zinc-500 dark:text-white/50">Order Reference:</span>
            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-[#FEF500]">#{shortId}</span>
            <button
              type="button"
              onClick={copyOrderId}
              className="rounded-lg bg-zinc-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:text-white/70 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy Full Order ID"
            >
              {copied ? (
                <span className="text-[#18C729]">Copied!</span>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* COD Instruction Box */}
        <div className="rounded-2xl border-2 border-[#18C729]/50 bg-[#18C729]/10 p-5 shadow-xl flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18C729] text-black shrink-0 font-bold">
            💵
          </div>
          <div className="flex-1 text-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
              Cash on Delivery (COD) Payment Instructions
            </h3>
            <p className="text-zinc-700 dark:text-white/70 leading-relaxed mb-2">
              Please have the exact cash amount of <strong className="text-emerald-600 dark:text-[#FEF500] font-mono text-sm">${order.total.toFixed(2)}</strong> ready when our courier agent arrives at your address.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 dark:text-white/50 font-mono">
              <span>Status: <strong className="text-[#18C729] uppercase">{order.status}</strong></span>
              <span>&bull;</span>
              <span>Courier: Standard Ground Dispatch</span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-xl dark:shadow-2xl space-y-6">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight border-b border-zinc-200 dark:border-white/10 pb-3">
            Order Receipt &amp; Delivery Info
          </h2>

          {/* Customer & Address Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <span className="text-zinc-400 dark:text-white/40 uppercase tracking-wider font-mono text-[10px]">Customer Details</span>
              <p className="font-bold text-zinc-900 dark:text-white text-sm">{order.customerName}</p>
              <p className="text-zinc-700 dark:text-white/70 font-mono">{order.phone}</p>
              {order.email && <p className="text-zinc-500 dark:text-white/50">{order.email}</p>}
            </div>

            <div className="space-y-1.5">
              <span className="text-zinc-400 dark:text-white/40 uppercase tracking-wider font-mono text-[10px]">Shipping Destination</span>
              <p className="text-zinc-900 dark:text-white font-medium">{order.address}</p>
              <p className="text-zinc-700 dark:text-white/70 font-medium">{order.city}</p>
              {order.notes && (
                <p className="text-[11px] text-amber-600 dark:text-[#FEF500]/80 italic mt-1">
                  Note: &quot;{order.notes}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Itemized Products */}
          <div className="border-t border-zinc-200 dark:border-white/10 pt-4 space-y-3">
            <span className="text-zinc-400 dark:text-white/40 uppercase tracking-wider font-mono text-[10px]">Purchased Items</span>
            <div className="divide-y divide-zinc-200 dark:divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-[11px] text-zinc-500 dark:text-white/50">{item.variantName}</p>
                    )}
                    <p className="text-[10px] text-zinc-400 dark:text-white/40 font-mono mt-0.5">
                      Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right font-mono font-bold text-zinc-900 dark:text-white">
                    ${item.lineTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="border-t border-zinc-200 dark:border-white/10 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-white/70">
              <span>Subtotal</span>
              <span className="font-mono text-zinc-900 dark:text-white">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-white/70">
              <span>Shipping</span>
              <span>
                {order.shipping === 0 ? (
                  <strong className="text-[#18C729]">FREE</strong>
                ) : (
                  <span className="font-mono text-zinc-900 dark:text-white">${order.shipping.toFixed(2)}</span>
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-white/10">
              <span>Total Payable</span>
              <span className="text-xl font-mono text-emerald-600 dark:text-[#FEF500] font-black">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Guest Prompt to Create Account */}
        {!isLoggedIn && (
          <div className="p-6 rounded-3xl border border-[#18C729]/30 bg-gradient-to-r from-[#18C729]/10 via-[#18C729]/5 to-transparent text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Create an Account to Track Your Order
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-md">
                Save your delivery address, track real-time delivery status, and reorder with one click.
              </p>
            </div>
            <Link
              href={`/signup?redirect=${encodeURIComponent(`/account/orders/${order.id}`)}`}
              className="px-5 py-2.5 rounded-xl bg-[#18C729] text-black font-extrabold text-xs hover:bg-[#15af24] shadow-md shadow-[#18C729]/20 transition shrink-0"
            >
              Create Account &rarr;
            </Link>
          </div>
        )}

        {isLoggedIn && (
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-center flex items-center justify-between">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              This order has been linked to your account.
            </span>
            <Link
              href={`/account/orders/${order.id}`}
              className="text-xs font-bold text-[#18C729] hover:underline"
            >
              View in Dashboard &rarr;
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-8 py-3.5 text-sm font-bold text-black hover:brightness-110 shadow-lg shadow-[#18C729]/20 transition-all cursor-pointer"
          >
            <span>Continue Shopping</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-100 dark:bg-white/5 px-6 py-3.5 text-xs font-bold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10 hover:border-zinc-400 dark:hover:border-white/25 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
