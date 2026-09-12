"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";

interface OrderDetailItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OrderDetailRecord {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  status: string;
  subtotal: number;
  shipping: number;
  discountAmount: number;
  discountCode: string | null;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderDetailItem[];
}

const TIMELINE_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

function getStepStatus(currentStatus: string, step: string): "completed" | "current" | "upcoming" {
  const normCurrent = currentStatus.toLowerCase();
  const currentIndex = TIMELINE_STEPS.indexOf(normCurrent);
  const stepIndex = TIMELINE_STEPS.indexOf(step);

  if (normCurrent === "cancelled" || normCurrent === "returned") {
    return "upcoming";
  }

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.JSX.Element {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const { addItems, showToast, openDrawer } = useCart();

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/customer/orders/${id}`);
        if (!res.ok) {
          throw new Error("Order not found or access denied");
        }
        const data = (await res.json()) as { order?: OrderDetailRecord };
        setOrder(data.order || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading order");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const handleReorder = async () => {
    if (!order) return;
    try {
      setIsReordering(true);
      const res = await fetch(`/api/customer/orders/${order.id}/reorder`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Could not reorder");
      const data = (await res.json()) as {
        items?: Array<{
          productId: string;
          variantId: string | null;
          title: string;
          price: number;
          quantity: number;
          image: string;
        }>;
      };

      if (data.items && data.items.length > 0) {
        addItems(
          data.items.map((it) => ({
            productId: it.productId,
            variantId: it.variantId || undefined,
            name: it.title,
            price: Number(it.price),
            quantity: it.quantity,
            image: it.image || "/images/placeholder.svg",
          }))
        );
        showToast("Items added back to your cart!", "success");
        openDrawer();
      }
    } catch {
      showToast("Unable to reorder items at this time.", "error");
    } finally {
      setIsReordering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-zinc-200 dark:bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 bg-zinc-200 dark:bg-white/5 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-12 text-center rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a]">
        <h2 className="text-base font-bold text-red-500">{error || "Order not found"}</h2>
        <p className="text-xs text-zinc-500 mt-1 mb-4">
          This order could not be retrieved or belongs to another account.
        </p>
        <Link
          href="/account/orders"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-[#18C729] text-black font-bold text-xs hover:bg-[#15af24]"
        >
          &larr; Back to Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-[#18C729] hover:underline mb-2 inline-flex items-center gap-1"
          >
            &larr; All Orders
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReorder}
            disabled={isReordering}
            className="px-4 py-2 rounded-xl bg-[#18C729] text-black font-extrabold text-xs hover:bg-[#15af24] shadow-md shadow-[#18C729]/20 transition disabled:opacity-50"
          >
            {isReordering ? "Adding to Cart..." : "Reorder All Items"}
          </button>
        </div>
      </div>

      {/* Visual Status Timeline */}
      <div className="p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">
          Order Status: <span className="text-[#18C729] font-black">{order.status.toUpperCase()}</span>
        </h2>

        <div className="grid grid-cols-5 gap-2 relative">
          {TIMELINE_STEPS.map((step, idx) => {
            const status = getStepStatus(order.status, step);
            const isDone = status === "completed";
            const isCurrent = status === "current";

            return (
              <div key={step} className="flex flex-col items-center text-center relative">
                {/* Node circle */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                    isDone
                      ? "bg-[#18C729] text-black ring-4 ring-[#18C729]/20"
                      : isCurrent
                      ? "bg-black text-[#18C729] border-2 border-[#18C729] ring-4 ring-[#18C729]/20 animate-pulse"
                      : "bg-zinc-100 dark:bg-white/5 text-zinc-400"
                  }`}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-bold mt-2 capitalize ${
                    isDone || isCurrent ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Items & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white mb-4">
              Items Ordered ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-zinc-100 dark:divide-white/5">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-white/10">
                      <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-[11px] text-zinc-400">Variant: {item.variantName}</p>
                      )}
                      <p className="text-[11px] text-zinc-500">
                        Rs. {Number(item.unitPrice).toFixed(2)} &times; {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-black text-zinc-900 dark:text-white shrink-0">
                    Rs. {Number(item.lineTotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm space-y-2">
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white">
              Shipping & Delivery Information
            </h2>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <p className="font-bold text-zinc-900 dark:text-white">{order.customerName}</p>
              <p>{order.phone}</p>
              <p>{order.address}</p>
              <p>{order.city}, Pakistan</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Payment */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-white/5 pb-3">
              Payment Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>Rs. {Number(order.subtotal).toFixed(2)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount {order.discountCode ? `(${order.discountCode})` : ""}</span>
                  <span>-Rs. {Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "FREE" : `Rs. ${Number(order.shipping).toFixed(2)}`}</span>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex justify-between text-sm font-black text-zinc-900 dark:text-white">
                <span>Total</span>
                <span className="text-[#18C729]">Rs. {Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-white/5">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Payment Method</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase">
                {order.paymentMethod || "Cash on Delivery (COD)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
