"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
}

interface OrderRecord {
  id: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  itemCount: number;
  items?: OrderItem[];
}

export default function AccountOrdersPage(): React.JSX.Element {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const { addItems, showToast, openDrawer } = useCart();

  const fetchOrders = useCallback(async (targetPage = 1) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/customer/orders?page=${targetPage}&limit=10`);
      if (res.ok) {
        const data = (await res.json()) as {
          orders?: OrderRecord[];
          total?: number;
          page?: number;
          totalPages?: number;
        };
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    showToast("Order ID copied to clipboard!", "success");
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const handleReorder = async (orderId: string) => {
    try {
      setReorderingId(orderId);
      const res = await fetch(`/api/customer/orders/${orderId}/reorder`, {
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
      setReorderingId(null);
    }
  };

  return (
    <div className="space-y-6 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h1 className="text-2xl font-black text-[var(--theme-text,#18181B)] tracking-tight font-[family-name:var(--theme-font-heading)]">
            Order History
          </h1>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-0.5">
            View, track, and reorder from your past store orders ({total} total)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[var(--theme-surface,#F4F4F5)] animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text-muted,#71717A)] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            No orders yet. Start shopping!
          </h3>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1 mb-6 max-w-sm mx-auto">
            Your completed purchases and shipment tracking updates will appear right here.
          </p>
          <Link href="/shop">
            <Button variant="primary" size="md">
              Start Shopping &rarr;
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm space-y-4 hover:border-[var(--theme-primary,#25D366)] transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--theme-border,#E4E4E7)]">
                <div className="flex items-center gap-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--theme-text-muted,#71717A)] uppercase tracking-wider block">
                      ORDER ID
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-[var(--theme-text,#18181B)] font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyOrderId(order.id)}
                        className="px-2 py-0.5 rounded-lg border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] text-[10px] font-bold text-[var(--theme-text,#18181B)] hover:bg-[var(--theme-border,#E4E4E7)] transition cursor-pointer"
                        title="Click to copy full Order ID"
                      >
                        {copiedOrderId === order.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    text={order.status}
                    variant={order.status.toLowerCase() === "delivered" ? "new" : "secondary"}
                    size="sm"
                  />
                  <span className="text-xs text-[var(--theme-text-muted,#71717A)]">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[var(--theme-text-muted,#71717A)]">
                    Total: <span className="text-sm font-black text-[var(--theme-primary,#25D366)] font-mono">${Number(order.total).toFixed(2)}</span>
                  </p>
                  <p className="text-[11px] text-[var(--theme-text-muted,#71717A)] mt-0.5">
                    {order.itemCount} items &bull; Payment via {order.paymentMethod?.toUpperCase() || "COD"}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(order.id)}
                    disabled={reorderingId === order.id}
                  >
                    {reorderingId === order.id ? "Adding..." : "Reorder"}
                  </Button>

                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="primary" size="sm">
                      View Details &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &larr; Previous
              </Button>
              <span className="text-xs font-bold text-[var(--theme-text-muted,#71717A)]">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next &rarr;
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
