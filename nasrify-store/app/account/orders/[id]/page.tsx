"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import Button from "@/components/themes/blocks/Button";
import Badge from "@/components/themes/blocks/Badge";

interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variantName?: string | null;
}

interface OrderDetail {
  id: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  discountAmount: number;
  discountCode?: string | null;
  shipping: number;
  total: number;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string | null;
  items?: OrderItem[];
}

function OrderStatusTimeline({ order }: { order: OrderDetail }) {
  const steps = [
    { key: "confirmed", label: "Order Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Dispatched" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStatus = order.status.toLowerCase();
  let activeIndex = 0;
  if (currentStatus === "processing") activeIndex = 1;
  else if (currentStatus === "shipped") activeIndex = 2;
  else if (currentStatus === "delivered") activeIndex = 3;

  return (
    <div className="p-6 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          Shipment Progress
        </h2>
        <Badge
          text={order.status}
          variant={currentStatus === "delivered" ? "new" : "secondary"}
          size="sm"
        />
      </div>

      <div className="relative flex items-center justify-between pt-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-[var(--theme-surface,#F4F4F5)] -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--theme-primary,#25D366)] -z-0 transition-all duration-500"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIndex;
          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-[var(--theme-primary,#25D366)] text-white shadow-sm"
                    : "bg-white border-2 border-[var(--theme-border,#E4E4E7)] text-[var(--theme-text-muted,#71717A)]"
                }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-[var(--theme-text,#18181B)]">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AccountOrderDetailPage(): React.JSX.Element {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const { addItems, showToast, openDrawer } = useCart();

  useEffect(() => {
    if (!id) return;
    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/customer/orders/${id}`);
        if (!res.ok) throw new Error("Order not found or unauthorized");
        const json = (await res.json()) as { success: boolean; data?: OrderDetail; error?: string };
        if (!json.success || !json.data) throw new Error(json.error || "Failed to load order");
        setOrder(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
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
      if (!res.ok) throw new Error("Could not reorder items");
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
        showToast(`${data.items.length} items added back to your cart!`, "success");
        openDrawer();
      }
    } catch (_err) {
      showToast("Unable to reorder items at this time.", "error");
    } finally {
      setIsReordering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface,#F4F4F5)] rounded-xl animate-pulse" />
        <div className="h-64 bg-[var(--theme-surface,#F4F4F5)] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-12 text-center rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm font-[family-name:var(--theme-font-body)]">
        <h2 className="text-base font-extrabold text-rose-600">{error || "Order not found"}</h2>
        <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1 mb-6">
          This order could not be retrieved or belongs to another account.
        </p>
        <Link href="/account/orders">
          <Button variant="primary" size="md">
            &larr; Back to Order History
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-[var(--theme-primary,#25D366)] hover:underline mb-2 inline-flex items-center gap-1"
          >
            &larr; Back to All Orders
          </Link>
          <h1 className="text-2xl font-black text-[var(--theme-text,#18181B)] tracking-tight font-[family-name:var(--theme-font-heading)]">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-0.5">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrintInvoice}
          >
            <span>Download Invoice</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleReorder}
            disabled={isReordering}
          >
            {isReordering ? "Adding..." : "Reorder All Items"}
          </Button>
        </div>
      </div>

      {/* Visual Status Timeline */}
      <OrderStatusTimeline order={order} />

      {/* Two Column Layout: Items & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Items & Delivery Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-7 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm">
            <h2 className="text-base font-extrabold text-[var(--theme-text,#18181B)] mb-4 font-[family-name:var(--theme-font-heading)]">
              Items Ordered ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-[var(--theme-border,#E4E4E7)]">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-14 w-14 rounded-xl bg-[var(--theme-surface,#F4F4F5)] flex items-center justify-center shrink-0 border border-[var(--theme-border,#E4E4E7)] text-[var(--theme-text-muted,#71717A)]">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--theme-text,#18181B)]">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-[11px] text-[var(--theme-text-muted,#71717A)]">Variant: {item.variantName}</p>
                      )}
                      <p className="text-[11px] text-[var(--theme-text-muted,#71717A)]">
                        ${Number(item.unitPrice).toFixed(2)} &times; {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-black text-[var(--theme-text,#18181B)] shrink-0 font-mono">
                    ${Number(item.lineTotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6 sm:p-7 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm space-y-2">
            <h2 className="text-sm font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
              Shipping &amp; Delivery Information
            </h2>
            <div className="text-xs text-[var(--theme-text-muted,#71717A)] space-y-1 leading-relaxed">
              <p className="font-extrabold text-[var(--theme-text,#18181B)]">{order.customerName}</p>
              <p>Phone: {order.phone}</p>
              <p>Street: {order.address}</p>
              <p>City: {order.city}</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Payment */}
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-[var(--theme-text,#18181B)] border-b border-[var(--theme-border,#E4E4E7)] pb-3 font-[family-name:var(--theme-font-heading)]">
              Payment Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[var(--theme-text-muted,#71717A)]">
                <span>Subtotal</span>
                <span className="font-mono text-[var(--theme-text,#18181B)] font-semibold">${Number(order.subtotal).toFixed(2)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[var(--theme-primary,#25D366)] font-bold">
                  <span>Discount {order.discountCode ? `(${order.discountCode})` : ""}</span>
                  <span className="font-mono">-${Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-[var(--theme-text-muted,#71717A)]">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "FREE" : `$${Number(order.shipping).toFixed(2)}`}</span>
              </div>

              <div className="pt-3 border-t border-[var(--theme-border,#E4E4E7)] flex justify-between text-sm font-black text-[var(--theme-text,#18181B)]">
                <span>Total</span>
                <span className="text-[var(--theme-primary,#25D366)] font-mono">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--theme-border,#E4E4E7)]">
              <span className="text-[10px] font-bold text-[var(--theme-text-muted,#71717A)] uppercase tracking-wider block">
                Payment Method
              </span>
              <span className="text-xs font-extrabold text-[var(--theme-text,#18181B)] uppercase mt-0.5 block">
                {order.paymentMethod || "Cash on Delivery (COD)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
