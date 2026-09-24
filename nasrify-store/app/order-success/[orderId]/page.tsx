"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { OrderWithItems } from "@/lib/orders";
import ProductCard from "@/components/themes/blocks/ProductCard";
import Button from "@/components/themes/blocks/Button";
import type { ProductWithImagesAndCategory } from "@/lib/products";

export default function OrderSuccessPage(): React.JSX.Element {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductWithImagesAndCategory[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
      })
      .catch(() => {});

    fetch("/api/products/search?limit=4&sort=popular")
      .then((res) => res.json())
      .then((json: any) => {
        if (json.success && Array.isArray(json.data)) {
          setRecommendedProducts(json.data);
        }
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

  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-4 text-[var(--theme-text,#18181B)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--theme-border,#E4E4E7)] border-t-[var(--theme-primary,#25D366)]" />
        <p className="mt-4 text-xs font-mono text-[var(--theme-text-muted,#71717A)] tracking-wider">RETRIEVING ORDER RECEIPT...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center text-[var(--theme-text,#18181B)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mb-4 border border-red-500/20">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[var(--theme-text,#18181B)] mb-2 font-[family-name:var(--theme-font-heading)]">Order Not Found</h1>
        <p className="text-xs text-[var(--theme-text-muted,#71717A)] max-w-sm mb-6">
          {error || "We couldn't locate the specified order reference."}
        </p>
        <Link href="/">
          <Button variant="primary" size="md">
            Return to Storefront
          </Button>
        </Link>
      </div>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-body)]">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Celebration Banner */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)] text-[var(--theme-primary,#25D366)] shadow-sm animate-bounce">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider mb-2">
              Order Confirmed &bull; Cash on Delivery
            </span>
            <h1 className="text-3xl font-black tracking-tight text-[var(--theme-text,#18181B)] sm:text-4xl font-[family-name:var(--theme-font-heading)]">
              Thank You For Your Order!
            </h1>
            <p className="mt-1 text-sm text-[var(--theme-text-muted,#71717A)]">
              We have received your order and our fulfillment team is preparing your package for dispatch.
            </p>
          </div>

          {/* Order ID bar */}
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white px-5 py-2.5 shadow-sm">
            <span className="text-xs text-[var(--theme-text-muted,#71717A)] font-medium">Order Reference:</span>
            <span className="font-mono font-bold text-sm text-[var(--theme-text,#18181B)]">#{shortId}</span>
            <button
              type="button"
              onClick={copyOrderId}
              className="rounded-lg bg-[var(--theme-surface,#F4F4F5)] px-2.5 py-1 text-[11px] font-semibold text-[var(--theme-text,#18181B)] hover:bg-[var(--theme-border,#E4E4E7)] transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy Full Order ID"
            >
              {copied ? (
                <span className="text-[var(--theme-primary,#25D366)] font-bold">Copied!</span>
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

        {/* Estimated Delivery & COD Instruction Card */}
        <div className="rounded-2xl border-2 border-[var(--theme-primary,#25D366)] bg-white p-5 shadow-sm flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-primary,#25D366)] shrink-0 text-xl">
            🚚
          </div>
          <div className="flex-1 text-xs space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                Estimated Delivery: <span className="text-[var(--theme-primary,#25D366)] underline underline-offset-2">{estimatedDelivery}</span>
              </h3>
              <span className="rounded-full bg-[var(--theme-surface,#F4F4F5)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--theme-text,#18181B)]">
                Ground Dispatch
              </span>
            </div>
            <p className="text-[var(--theme-text-muted,#71717A)] leading-relaxed">
              Please have the exact cash amount of <strong className="text-[var(--theme-text,#18181B)] font-mono text-sm">${order.total.toFixed(2)}</strong> ready when our courier agent arrives.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--theme-text-muted,#71717A)] font-mono pt-1">
              <span>Status: <strong className="text-[var(--theme-primary,#25D366)] uppercase">{order.status}</strong></span>
              <span>&bull;</span>
              <span>Inspect parcel before payment</span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="rounded-3xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-[var(--theme-text,#18181B)] tracking-tight border-b border-[var(--theme-border,#E4E4E7)] pb-3 font-[family-name:var(--theme-font-heading)]">
            Order Receipt &amp; Delivery Info
          </h2>

          {/* Customer & Address Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)]">
              <span className="text-[var(--theme-text-muted,#71717A)] uppercase tracking-wider font-mono text-[10px] font-bold">Customer Details</span>
              <p className="font-bold text-[var(--theme-text,#18181B)] text-sm">{order.customerName}</p>
              <p className="text-[var(--theme-text-muted,#71717A)] font-mono">{order.phone}</p>
              {order.email && <p className="text-[var(--theme-text-muted,#71717A)]">{order.email}</p>}
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)]">
              <span className="text-[var(--theme-text-muted,#71717A)] uppercase tracking-wider font-mono text-[10px] font-bold">Shipping Destination</span>
              <p className="text-[var(--theme-text,#18181B)] font-medium">{order.address}</p>
              <p className="text-[var(--theme-text-muted,#71717A)] font-medium">{order.city}</p>
              {order.notes && (
                <p className="text-[11px] text-[var(--theme-text-muted,#71717A)] italic mt-1">
                  Note: &quot;{order.notes}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Itemized Products */}
          <div className="border-t border-[var(--theme-border,#E4E4E7)] pt-4 space-y-3">
            <span className="text-[var(--theme-text-muted,#71717A)] uppercase tracking-wider font-mono text-[10px] font-bold">Purchased Items</span>
            <div className="divide-y divide-[var(--theme-border,#E4E4E7)]">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-[var(--theme-text,#18181B)]">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-[11px] text-[var(--theme-text-muted,#71717A)]">{item.variantName}</p>
                    )}
                    <p className="text-[10px] text-[var(--theme-text-muted,#71717A)] font-mono mt-0.5">
                      Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right font-mono font-bold text-[var(--theme-text,#18181B)]">
                    ${item.lineTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="border-t border-[var(--theme-border,#E4E4E7)] pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-[var(--theme-text-muted,#71717A)]">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-[var(--theme-text,#18181B)]">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--theme-text-muted,#71717A)]">
              <span>Shipping</span>
              <span>
                {order.shipping === 0 ? (
                  <strong className="text-[var(--theme-primary,#25D366)] font-bold">FREE</strong>
                ) : (
                  <span className="font-mono text-[var(--theme-text,#18181B)]">${order.shipping.toFixed(2)}</span>
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[var(--theme-text,#18181B)] pt-2 border-t border-[var(--theme-border,#E4E4E7)]">
              <span>Total Payable</span>
              <span className="text-xl font-mono text-[var(--theme-primary,#25D366)] font-black">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Guest Prompt to Create Account */}
        {!isLoggedIn && (
          <div className="p-6 rounded-3xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                Create an Account to Track Your Order
              </h3>
              <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1 max-w-md">
                Save your delivery address, track real-time delivery status, and reorder with one click.
              </p>
            </div>
            <Link
              href={`/signup?redirect=${encodeURIComponent(`/account/orders/${order.id}`)}`}
              className="shrink-0"
            >
              <Button variant="primary" size="sm">
                Create Account &rarr;
              </Button>
            </Link>
          </div>
        )}

        {isLoggedIn && (
          <div className="p-4 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] text-center flex items-center justify-between">
            <span className="text-xs text-[var(--theme-text-muted,#71717A)] font-medium">
              This order has been linked to your account.
            </span>
            <Link
              href={`/account/orders/${order.id}`}
              className="text-xs font-bold text-[var(--theme-primary,#25D366)] hover:underline"
            >
              View in Dashboard &rarr;
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={`/track-order?id=${encodeURIComponent(order.id)}`}
            className="w-full sm:w-auto"
          >
            <Button variant="primary" size="md">
              <span>Track Order Status &rarr;</span>
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md">
              <span>Continue Shopping</span>
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[var(--theme-button-radius,var(--theme-radius,8px))] border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] px-6 py-2.5 text-xs font-bold text-[var(--theme-text,#18181B)] hover:bg-[var(--theme-border,#E4E4E7)] transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Receipt</span>
          </button>
        </div>

        {/* You May Also Like Carousel */}
        {recommendedProducts.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-[var(--theme-border,#E4E4E7)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-primary,#25D366)]">
                  Recommended For You
                </span>
                <h2 className="text-xl font-black text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                  You May Also Like
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-semibold text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] transition-colors hover:underline"
              >
                View Catalog &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
