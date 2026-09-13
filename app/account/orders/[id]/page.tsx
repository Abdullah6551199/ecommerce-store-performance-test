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

  const handlePrintInvoice = () => {
    window.print();
  };

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
        <div className="h-8 w-48 bg-purple-100/50 dark:bg-purple-950/40 rounded-xl animate-pulse" />
        <div className="h-64 bg-purple-100/40 dark:bg-purple-950/30 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-12 text-center rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
        <h2 className="text-base font-extrabold text-rose-600">{error || "Order not found"}</h2>
        <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1 mb-6">
          This order could not be retrieved or belongs to another account.
        </p>
        <Link
          href="/account/orders"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition"
        >
          &larr; Back to Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-[#960DF2] dark:text-[#C06EF7] hover:underline mb-2 inline-flex items-center gap-1"
          >
            &larr; Back to All Orders
          </Link>
          <h1 className="text-2xl font-black text-[#3C0561] dark:text-white tracking-tight">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-0.5">
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

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrintInvoice}
            className="px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#1E0230] text-xs font-bold text-[#3C0561] dark:text-purple-200 hover:border-[#960DF2] transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Download Invoice</span>
          </button>
          <button
            type="button"
            onClick={handleReorder}
            disabled={isReordering}
            className="px-5 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isReordering ? "Adding..." : "Reorder All Items"}
          </button>
        </div>
      </div>

      {/* Visual Status Timeline */}
      <div className="p-6 sm:p-7 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-purple-300/70">
            Order Milestone Progress
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC] border border-purple-200 dark:border-purple-700">
            {order.status.toUpperCase()}
          </span>
        </div>

        {/* Timeline with connecting track */}
        <div className="relative">
          {/* Background Track Line */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-purple-100 dark:bg-purple-900/40 -translate-y-1/2 z-0 hidden sm:block" />

          <div className="grid grid-cols-5 gap-2 relative z-10">
            {TIMELINE_STEPS.map((step, idx) => {
              const status = getStepStatus(order.status, step);
              const isDone = status === "completed";
              const isCurrent = status === "current";

              return (
                <div key={step} className="flex flex-col items-center text-center">
                  {/* Node circle */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all ${
                      isDone
                        ? "bg-[#960DF2] text-white ring-4 ring-purple-500/20"
                        : isCurrent
                        ? "bg-purple-50 dark:bg-[#2A0344] text-[#960DF2] dark:text-[#EACFFC] border-2 border-[#960DF2] ring-4 ring-purple-500/20 animate-pulse"
                        : "bg-slate-100 dark:bg-purple-950/40 text-slate-400 dark:text-purple-400/50"
                    }`}
                  >
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-extrabold mt-2.5 capitalize ${
                      isDone || isCurrent ? "text-[#3C0561] dark:text-white" : "text-slate-400 dark:text-purple-300/40"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Items & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Items & Delivery Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
            <h2 className="text-base font-extrabold text-[#3C0561] dark:text-white mb-4">
              Items Ordered ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-purple-100 dark:divide-purple-900/40">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800">
                      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-[11px] text-purple-600 dark:text-purple-300">Variant: {item.variantName}</p>
                      )}
                      <p className="text-[11px] text-slate-500 dark:text-purple-300/70">
                        Rs. {Number(item.unitPrice).toFixed(2)} &times; {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-black text-[#3C0561] dark:text-white shrink-0">
                    Rs. {Number(item.lineTotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6 sm:p-7 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm space-y-2">
            <h2 className="text-sm font-extrabold text-[#3C0561] dark:text-white">
              Shipping &amp; Delivery Information
            </h2>
            <div className="text-xs text-slate-600 dark:text-purple-300/80 space-y-1 leading-relaxed">
              <p className="font-extrabold text-[#3C0561] dark:text-white">{order.customerName}</p>
              <p>Phone: {order.phone}</p>
              <p>Street: {order.address}</p>
              <p>City: {order.city}, Pakistan</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Payment */}
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-[#3C0561] dark:text-white border-b border-purple-100 dark:border-purple-900/40 pb-3">
              Payment Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-purple-300/80">
                <span>Subtotal</span>
                <span>Rs. {Number(order.subtotal).toFixed(2)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#960DF2] dark:text-[#EACFFC] font-bold">
                  <span>Discount {order.discountCode ? `(${order.discountCode})` : ""}</span>
                  <span>-Rs. {Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 dark:text-purple-300/80">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "FREE" : `Rs. ${Number(order.shipping).toFixed(2)}`}</span>
              </div>

              <div className="pt-3 border-t border-purple-100 dark:border-purple-900/40 flex justify-between text-sm font-black text-[#3C0561] dark:text-white">
                <span>Total</span>
                <span className="text-[#960DF2] dark:text-[#EACFFC]">Rs. {Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-purple-100 dark:border-purple-900/40">
              <span className="text-[10px] font-bold text-slate-400 dark:text-purple-300/60 uppercase tracking-wider block">
                Payment Method
              </span>
              <span className="text-xs font-extrabold text-[#3C0561] dark:text-white uppercase mt-0.5 block">
                {order.paymentMethod || "Cash on Delivery (COD)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
