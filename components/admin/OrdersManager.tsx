"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { OrderRecord, OrderWithItems, OrderStatus } from "@/lib/orders";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  confirmed: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  processing: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  shipped: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  delivered: { bg: "bg-[#18C729]/15", text: "text-[#18C729]", border: "border-[#18C729]/30" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  returned: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
};

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export default function OrdersManager(): React.JSX.Element {
  const [ordersList, setOrdersList] = useState<(OrderRecord & { itemCount: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Order for Details Modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderWithItems | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<OrderStatus>("pending");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = (await res.json()) as {
        success: boolean;
        data?: { orders: (OrderRecord & { itemCount: number })[]; totalCount: number };
        error?: string;
      };

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch orders");
      }

      setOrdersList(json.data?.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading orders");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Open Details Modal
  const handleOpenDetails = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setUpdateFeedback(null);
    try {
      setIsDetailsLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const json = (await res.json()) as {
        success: boolean;
        data?: OrderWithItems;
        error?: string;
      };
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Failed to fetch order details");
      }
      setSelectedOrderDetails(json.data);
      setStatusToUpdate(json.data.status as OrderStatus);
    } catch (err) {
      console.error("Error loading order details:", err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrderId(null);
    setSelectedOrderDetails(null);
    setUpdateFeedback(null);
  };

  // Update Status
  const handleUpdateStatus = async () => {
    if (!selectedOrderId) return;
    try {
      setIsUpdatingStatus(true);
      setUpdateFeedback(null);

      const res = await fetch(`/api/admin/orders/${selectedOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToUpdate }),
      });

      const json = (await res.json()) as {
        success: boolean;
        data?: OrderRecord;
        error?: string;
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      setUpdateFeedback({
        type: "success",
        message: `Order status successfully updated to "${statusToUpdate}"`,
      });

      if (selectedOrderDetails) {
        setSelectedOrderDetails({
          ...selectedOrderDetails,
          status: statusToUpdate,
        });
      }

      // Update in main table list
      setOrdersList((prev) =>
        prev.map((o) => (o.id === selectedOrderId ? { ...o, status: statusToUpdate } : o))
      );
    } catch (err) {
      setUpdateFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update status",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Status Metrics
  const metrics = useMemo(() => {
    const total = ordersList.length;
    const pending = ordersList.filter((o) => o.status === "pending").length;
    const shipped = ordersList.filter((o) => o.status === "shipped").length;
    const delivered = ordersList.filter((o) => o.status === "delivered").length;
    return { total, pending, shipped, delivered };
  }, [ordersList]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Orders & Fulfillment</span>
            <span className="rounded-full bg-[#18C729]/15 border border-[#18C729]/30 px-2.5 py-0.5 text-xs font-mono text-[#18C729]">
              Live D1 Pipeline
            </span>
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Track customer checkouts, COD cash receipts, and manage shipment fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <svg
              className={`h-4 w-4 ${isLoading ? "animate-spin text-[#18C729]" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0c140f] p-4 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">Total Orders</p>
          <p className="mt-1 text-2xl font-bold font-mono text-white">{metrics.total}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0c140f] p-4 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-yellow-400">Pending Review</p>
          <p className="mt-1 text-2xl font-bold font-mono text-yellow-400">{metrics.pending}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0c140f] p-4 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">In Transit</p>
          <p className="mt-1 text-2xl font-bold font-mono text-cyan-400">{metrics.shipped}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0c140f] p-4 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#18C729]">Delivered (Paid)</p>
          <p className="mt-1 text-2xl font-bold font-mono text-[#18C729]">{metrics.delivered}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-2xl border border-white/10 bg-[#0c140f] p-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, city, order ID..."
            className="w-full rounded-xl border border-white/15 bg-black/40 pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#18C729] focus:outline-none transition-colors"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", ...ALL_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? "bg-[#18C729] text-black shadow-md shadow-[#18C729]/20"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c140f] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-black/40 text-white/50 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Customer & Phone</th>
                <th className="px-5 py-3.5">City & Destination</th>
                <th className="px-5 py-3.5 text-center">Items</th>
                <th className="px-5 py-3.5 text-right">Total Amount</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-white/40">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-[#18C729] mb-2" />
                    <p className="font-mono text-[11px]">LOADING ORDERS FROM D1...</p>
                  </td>
                </tr>
              ) : ordersList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-white/40">
                    <svg className="mx-auto h-10 w-10 text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="font-semibold text-white/60">No orders found</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Orders placed by customers will appear here.</p>
                  </td>
                </tr>
              ) : (
                ordersList.map((order) => {
                  const shortId = order.id.slice(0, 8).toUpperCase();
                  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => handleOpenDetails(order.id)}
                    >
                      {/* Order ID */}
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        <span className="text-[#FEF500]">#{shortId}</span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-white/50 text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">{order.customerName}</p>
                        <p className="text-[11px] text-white/50 font-mono">{order.phone}</p>
                      </td>

                      {/* Destination */}
                      <td className="px-5 py-4 max-w-xs truncate">
                        <p className="text-white font-medium">{order.city}</p>
                        <p className="text-[11px] text-white/40 truncate">{order.address}</p>
                      </td>

                      {/* Item Count */}
                      <td className="px-5 py-4 text-center font-mono font-bold text-white/70">
                        {order.itemCount}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-right font-mono font-bold text-sm text-[#FEF500]">
                        ${order.total.toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-white/80 uppercase">
                          💵 {order.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(order.id)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Status Modal */}
      {selectedOrderId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleCloseDetails}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#09100c] p-6 shadow-2xl space-y-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Order Details</span>
                  <span className="font-mono text-[#FEF500]">
                    #{selectedOrderId.slice(0, 8).toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-white/50 font-mono mt-0.5">{selectedOrderId}</p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {isDetailsLoading ? (
              <div className="py-16 text-center text-white/40">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#18C729] mb-3" />
                <p className="font-mono text-xs">LOADING ORDER BREAKDOWN...</p>
              </div>
            ) : selectedOrderDetails ? (
              <div className="space-y-6 text-xs">
                {/* Status Update Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                        Current Status
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                            (STATUS_COLORS[selectedOrderDetails.status] || STATUS_COLORS.pending).bg
                          } ${(STATUS_COLORS[selectedOrderDetails.status] || STATUS_COLORS.pending).text} ${
                            (STATUS_COLORS[selectedOrderDetails.status] || STATUS_COLORS.pending).border
                          }`}
                        >
                          {selectedOrderDetails.status}
                        </span>
                      </div>
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-2">
                      <select
                        value={statusToUpdate}
                        onChange={(e) => setStatusToUpdate(e.target.value as OrderStatus)}
                        className="rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-xs font-semibold text-white focus:border-[#18C729] focus:outline-none"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-[#09100c] text-white">
                            {st.toUpperCase()}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleUpdateStatus}
                        disabled={isUpdatingStatus || statusToUpdate === selectedOrderDetails.status}
                        className="rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-4 py-2 text-xs font-bold text-black hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        {isUpdatingStatus ? "Updating..." : "Update Status"}
                      </button>
                    </div>
                  </div>

                  {updateFeedback && (
                    <p
                      className={`text-xs font-medium pt-1 ${
                        updateFeedback.type === "success" ? "text-[#18C729]" : "text-red-400"
                      }`}
                    >
                      {updateFeedback.message}
                    </p>
                  )}
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                      Customer Info
                    </span>
                    <p className="font-bold text-white text-sm">{selectedOrderDetails.customerName}</p>
                    <p className="font-mono text-white/70">{selectedOrderDetails.phone}</p>
                    {selectedOrderDetails.email && (
                      <p className="text-white/50">{selectedOrderDetails.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                      Delivery Address
                    </span>
                    <p className="font-medium text-white">{selectedOrderDetails.address}</p>
                    <p className="font-medium text-white/70">{selectedOrderDetails.city}</p>
                    {selectedOrderDetails.notes && (
                      <p className="text-[11px] text-[#FEF500]/80 italic mt-1">
                        Note: &quot;{selectedOrderDetails.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Purchased Items Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                    Purchased Items ({selectedOrderDetails.items.length})
                  </span>
                  <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    {selectedOrderDetails.items.map((it) => (
                      <div key={it.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-white">{it.productName}</p>
                          {it.variantName && (
                            <p className="text-[11px] text-white/50">{it.variantName}</p>
                          )}
                          <p className="text-[10px] text-white/40 font-mono mt-0.5">
                            Qty: {it.quantity} × ${it.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right font-mono font-bold text-white">
                          ${it.lineTotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2 font-mono">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>${selectedOrderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span>${selectedOrderDetails.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Payment Method</span>
                    <span className="uppercase">{selectedOrderDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                    <span>Total Due</span>
                    <span className="text-lg font-black text-[#FEF500]">
                      ${selectedOrderDetails.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
