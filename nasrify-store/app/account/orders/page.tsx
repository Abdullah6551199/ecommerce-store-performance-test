"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

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

function getStatusBadge(status: string) {
  const norm = status.toLowerCase();
  switch (norm) {
    case "delivered":
      return "bg-purple-100 text-[#960DF2] dark:bg-purple-900/60 dark:text-[#EACFFC] border-purple-300 dark:border-purple-700";
    case "shipped":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    case "processing":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "confirmed":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "cancelled":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h1 className="text-2xl font-black text-[#3C0561] dark:text-white tracking-tight">
            Order History
          </h1>
          <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-0.5">
            View, track, and reorder from your past store orders ({total} total)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-purple-100/50 dark:bg-purple-950/40 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[#3C0561] dark:text-white">No orders yet. Start shopping!</h3>
          <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1 mb-6 max-w-sm mx-auto">
            Your completed purchases and shipment tracking updates will appear right here.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm space-y-4 hover:border-purple-300 dark:hover:border-purple-700 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-purple-100 dark:border-purple-900/40">
                <div className="flex items-center gap-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-purple-300/60 uppercase tracking-wider block">
                      ORDER ID
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-[#3C0561] dark:text-white font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyOrderId(order.id)}
                        className="px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/60 text-[10px] font-bold text-[#960DF2] dark:text-[#EACFFC] hover:bg-purple-100 transition"
                        title="Click to copy full Order ID"
                      >
                        {copiedOrderId === order.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-purple-300/80">
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
                  <p className="text-xs text-slate-500 dark:text-purple-300/80">
                    Total: <span className="text-sm font-black text-[#960DF2] dark:text-[#EACFFC]">Rs. {Number(order.total).toFixed(2)}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-purple-300/60 mt-0.5">
                    {order.itemCount} items &bull; Payment via {order.paymentMethod?.toUpperCase() || "COD"}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleReorder(order.id)}
                    disabled={reorderingId === order.id}
                    className="px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/40 hover:border-[#960DF2] text-xs font-bold text-[#3C0561] dark:text-purple-200 hover:text-[#960DF2] transition disabled:opacity-50"
                  >
                    {reorderingId === order.id ? "Adding..." : "Reorder"}
                  </button>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="px-4 py-2 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800 text-xs font-bold text-[#3C0561] dark:text-white disabled:opacity-30 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
              >
                &larr; Previous
              </button>
              <span className="text-xs font-bold text-slate-500 dark:text-purple-300">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800 text-xs font-bold text-[#3C0561] dark:text-white disabled:opacity-30 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
