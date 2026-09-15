"use client";

import React from "react";
import Link from "next/link";
import type { CategoryPerformanceItem } from "@/lib/analytics";

interface RecentOrderSummary {
  id: string;
  customerName: string;
  email: string | null;
  total: number;
  status: string;
  createdAt: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

interface AnalyticsTablesProps {
  recentOrders: RecentOrderSummary[];
  lowStockProducts: LowStockProduct[];
  categories: CategoryPerformanceItem[];
  loading: boolean;
}

export default function AnalyticsTables({
  recentOrders,
  lowStockProducts,
  categories,
  loading,
}: AnalyticsTablesProps): React.JSX.Element {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-64 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5" />
        <div className="h-64 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <span className="rounded bg-[#18C729]/15 text-[#18C729] px-2 py-0.5 text-[10px] font-bold uppercase">Delivered</span>;
      case "shipped":
        return <span className="rounded bg-[#3de34d]/15 text-[#3de34d] px-2 py-0.5 text-[10px] font-bold uppercase">Shipped</span>;
      case "processing":
        return <span className="rounded bg-[#FEF500]/25 text-amber-600 dark:text-[#FEF500] px-2 py-0.5 text-[10px] font-bold uppercase">Processing</span>;
      case "confirmed":
        return <span className="rounded bg-blue-500/15 text-blue-500 dark:text-blue-400 px-2 py-0.5 text-[10px] font-bold uppercase">Confirmed</span>;
      case "cancelled":
        return <span className="rounded bg-red-500/15 text-red-500 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold uppercase">Cancelled</span>;
      default:
        return <span className="rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase">Pending</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Recent Orders Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                Recent Orders
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-white/50">
                Latest transactions processed through the storefront
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#18C729] hover:underline"
            >
              View All Orders &rarr;
            </Link>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-white/5 text-[10px] uppercase font-bold text-zinc-500 dark:text-white/50">
                <tr>
                  <th className="px-3 py-2">Order ID</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-400 dark:text-white/40">
                      No recent orders recorded.
                    </td>
                  </tr>
                ) : (
                  recentOrders.slice(0, 8).map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                      <td className="px-3 py-2.5 font-mono text-[11px] text-[#18C729]">
                        <Link href="/admin/orders" className="hover:underline">
                          #{order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-zinc-900 dark:text-white truncate max-w-[120px]">
                        {order.customerName}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-zinc-900 dark:text-white">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">{getStatusBadge(order.status)}</td>
                      <td className="px-3 py-2.5 text-[10px] text-zinc-400 dark:text-white/50 font-mono">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Low Stock Alerts Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Low Stock Inventory Alerts</span>
                {lowStockProducts.length > 0 && (
                  <span className="rounded-full bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                    {lowStockProducts.length} items
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-white/50">
                Products currently running below their minimum reorder thresholds
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-[#18C729] hover:underline"
            >
              Manage Catalog &rarr;
            </Link>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-white/5 text-[10px] uppercase font-bold text-zinc-500 dark:text-white/50">
                <tr>
                  <th className="px-3 py-2">Product Name</th>
                  <th className="px-3 py-2">Current Stock</th>
                  <th className="px-3 py-2">Threshold</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#18C729]">
                      ✓ All inventory levels are healthy and above minimum thresholds.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.slice(0, 8).map((prod) => (
                    <tr key={prod.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                      <td className="px-3 py-2.5 font-bold text-zinc-900 dark:text-white truncate max-w-[160px]">
                        {prod.name}
                      </td>
                      <td className="px-3 py-2.5 font-mono">
                        <span className="rounded bg-red-500/15 text-red-500 dark:text-red-400 px-2 py-0.5 font-bold text-[11px]">
                          {prod.stockQuantity} units
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-zinc-500 dark:text-white/60">
                        {prod.lowStockThreshold} min
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Link
                          href={`/admin/products`}
                          className="rounded-lg bg-[#18C729]/15 text-[#18C729] border border-[#18C729]/30 px-2.5 py-1 text-[10px] font-bold hover:bg-[#18C729]/25 transition-colors"
                        >
                          Restock
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
