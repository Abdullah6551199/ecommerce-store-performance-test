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
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "shipped":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "processing":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "confirmed":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
  }
}

export default function AccountOrdersPage(): React.JSX.Element {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Order History
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            View all your past and current store orders ({total} total)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-zinc-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No Orders Found</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#18C729] text-black font-bold text-xs hover:bg-[#15af24]"
          >
            Start Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm space-y-4 hover:border-zinc-300 dark:hover:border-white/20 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-white/5">
                <div>
                  <span className="text-[11px] text-zinc-400 font-mono">ORDER ID</span>
                  <p className="text-sm font-black text-zinc-900 dark:text-white">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-zinc-400">
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
                  <p className="text-xs text-zinc-500">
                    Total: <span className="text-sm font-black text-zinc-900 dark:text-white">Rs. {Number(order.total).toFixed(2)}</span>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {order.itemCount} items &bull; Payment via {order.paymentMethod?.toUpperCase() || "COD"}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleReorder(order.id)}
                    disabled={reorderingId === order.id}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-[#18C729] text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-[#18C729] transition disabled:opacity-50"
                  >
                    {reorderingId === order.id ? "Adding..." : "Reorder"}
                  </button>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="px-3.5 py-2 rounded-xl bg-[#18C729] text-black text-xs font-bold hover:bg-[#15af24] shadow-md shadow-[#18C729]/20 transition"
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
                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold disabled:opacity-30"
              >
                &larr; Previous
              </button>
              <span className="text-xs text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold disabled:opacity-30"
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
