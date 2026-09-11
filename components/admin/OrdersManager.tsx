"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { OrderRecord, OrderWithItems, OrderStatus } from "@/lib/orders";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
  confirmed: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30" },
  processing: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/30" },
  shipped: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/30" },
  delivered: { bg: "bg-[#18C729]/15", text: "text-emerald-700 dark:text-[#18C729]", border: "border-[#18C729]/40" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/30" },
  returned: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/30" },
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

  // Part 4: Inline Status Auto-Update
  const [activeDropdownOrderId, setActiveDropdownOrderId] = useState<string | null>(null);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<Set<string>>(new Set());

  // Part 5: Bulk Order Status Selection
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Keyboard support: ESC closes any open dropdowns or modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdownOrderId(null);
        setBulkDropdownOpen(false);
        if (selectedOrderId) {
          setSelectedOrderId(null);
          setSelectedOrderDetails(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrderId]);

  // Click outside listener for inline dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-status-dropdown-container]")) {
        setActiveDropdownOrderId(null);
      }
      if (!target.closest("[data-bulk-dropdown-container]")) {
        setBulkDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchOrders = useCallback(async (pageToFetch = currentPage) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String((pageToFetch - 1) * PAGE_SIZE));

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
      setTotalCount(json.data?.totalCount || 0);
      setSelectedOrderIds(new Set()); // Reset selections on refresh or page change
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading orders");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, currentPage, PAGE_SIZE]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  // Open Details Modal
  const handleOpenDetails = async (orderId: string) => {
    setSelectedOrderId(orderId);
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
    } catch (err) {
      console.error("Error loading order details:", err);
      showToast(err instanceof Error ? err.message : "Failed to load order details", "error");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrderId(null);
    setSelectedOrderDetails(null);
  };

  // Part 4: Inline Auto-Update Status on Selection
  const handleInlineStatusSelect = async (orderId: string, newStatus: OrderStatus) => {
    setActiveDropdownOrderId(null);
    const existing = ordersList.find((o) => o.id === orderId);
    if (!existing || existing.status === newStatus) return;

    const previousStatus = existing.status;

    // Optimistic UI update immediately
    setUpdatingOrderIds((prev) => new Set(prev).add(orderId));
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
      setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus });
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update order status");
      }

      showToast(`Order #${orderId.slice(0, 8).toUpperCase()} updated to ${newStatus}`, "success");
    } catch (err) {
      // Revert if failed
      setOrdersList((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o))
      );
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails({ ...selectedOrderDetails, status: previousStatus });
      }
      showToast(err instanceof Error ? err.message : "Failed to update status", "error");
    } finally {
      setUpdatingOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  // Part 5: Checkbox Selection Handlers
  const isAllSelected = ordersList.length > 0 && ordersList.every((o) => selectedOrderIds.has(o.id));
  const isSomeSelected = selectedOrderIds.size > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(ordersList.map((o) => o.id)));
    }
  };

  const handleToggleSelectRow = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  // Part 5: Bulk Status Update
  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    setBulkDropdownOpen(false);
    if (selectedOrderIds.size === 0) return;

    const idsToUpdate = Array.from(selectedOrderIds);
    setIsBulkUpdating(true);
    setBulkProgress(`Updating ${idsToUpdate.length} orders to ${newStatus}...`);

    try {
      const res = await fetch("/api/admin/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToUpdate, status: newStatus }),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Bulk update failed");
      }

      // Update state locally
      setOrdersList((prev) =>
        prev.map((o) => (selectedOrderIds.has(o.id) ? { ...o, status: newStatus } : o))
      );
      showToast(`${idsToUpdate.length} orders updated to ${newStatus}`, "success");
      setSelectedOrderIds(new Set());
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update selected orders", "error");
    } finally {
      setIsBulkUpdating(false);
      setBulkProgress(null);
    }
  };

  // Export Selected Orders to CSV
  const handleExportSelectedCsv = () => {
    const selectedList = ordersList.filter((o) => selectedOrderIds.has(o.id));
    if (selectedList.length === 0) return;

    const rows: string[][] = [
      ["Order ID", "Date", "Customer Name", "Phone", "City", "Address", "Item Count", "Total Amount", "Payment Method", "Status"],
      ...selectedList.map((o) => [
        o.id,
        new Date(o.createdAt).toISOString(),
        o.customerName,
        o.phone,
        o.city,
        o.address,
        String(o.itemCount),
        o.total.toFixed(2),
        o.paymentMethod,
        o.status,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apex-selected-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${selectedList.length} orders to CSV`, "success");
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
    <div className="space-y-6 pb-20">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold shadow-2xl transition-all duration-300 ${
            toast.type === "success"
              ? "bg-[#18C729] text-black shadow-[#18C729]/30"
              : "bg-red-500 text-white shadow-red-500/30"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Orders & Fulfillment</span>
            <span className="rounded-full bg-[#18C729]/15 border border-[#18C729]/30 px-2.5 py-0.5 text-xs font-mono text-[#18C729]">
              Live D1 Pipeline
            </span>
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-white/60">
            Track customer checkouts, COD cash receipts, and manage shipment fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
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
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-white/40">Total Orders</p>
          <p className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">{metrics.total}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Review</p>
          <p className="mt-1 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{metrics.pending}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400">In Transit</p>
          <p className="mt-1 text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">{metrics.shipped}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#18C729]">Delivered (Paid)</p>
          <p className="mt-1 text-2xl font-bold font-mono text-[#18C729]">{metrics.delivered}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by customer name, phone, city, order ID..."
            className="w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-black/40 pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/40 focus:border-[#18C729] focus:outline-none transition-colors"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-white/40"
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
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? "bg-[#18C729] text-black shadow-md shadow-[#18C729]/20"
                  : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-white/60 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] shadow-xl relative">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/40 text-zinc-500 dark:text-white/50 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                {/* Checkbox Column Header */}
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all visible orders"
                    className="h-4 w-4 rounded border-zinc-300 dark:border-white/30 text-[#18C729] focus:ring-[#18C729] accent-[#18C729] cursor-pointer"
                  />
                </th>
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
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5 text-zinc-700 dark:text-white/80">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-zinc-400 dark:text-white/40">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 dark:border-white/20 border-t-[#18C729] mb-2" />
                    <p className="font-mono text-[11px]">LOADING ORDERS FROM DATABASE...</p>
                  </td>
                </tr>
              ) : ordersList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-zinc-400 dark:text-white/40">
                    <svg className="mx-auto h-10 w-10 text-zinc-300 dark:text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="font-semibold text-zinc-600 dark:text-white/60">No orders found</p>
                    <p className="text-[11px] text-zinc-400 dark:text-white/40 mt-0.5">Orders placed by customers will appear here.</p>
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
                  const isRowSelected = selectedOrderIds.has(order.id);
                  const isRowUpdating = updatingOrderIds.has(order.id);
                  const isDropdownOpen = activeDropdownOrderId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isRowSelected
                          ? "bg-[#18C729]/10 dark:bg-[#18C729]/10"
                          : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td className="px-4 py-4 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => handleToggleSelectRow(order.id)}
                          aria-label={`Select order ${shortId}`}
                          className="h-4 w-4 rounded border-zinc-300 dark:border-white/30 text-[#18C729] focus:ring-[#18C729] accent-[#18C729] cursor-pointer"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="px-5 py-4 font-mono font-bold text-zinc-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(order.id)}
                          className="text-emerald-700 dark:text-[#FEF500] hover:underline cursor-pointer"
                        >
                          #{shortId}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-zinc-500 dark:text-white/50 text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-zinc-900 dark:text-white">{order.customerName}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-white/50 font-mono">{order.phone}</p>
                      </td>

                      {/* Destination */}
                      <td className="px-5 py-4 max-w-xs truncate">
                        <p className="text-zinc-800 dark:text-white font-medium">{order.city}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-white/40 truncate">{order.address}</p>
                      </td>

                      {/* Item Count */}
                      <td className="px-5 py-4 text-center font-mono font-bold text-zinc-700 dark:text-white/70">
                        {order.itemCount}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-right font-mono font-bold text-sm text-emerald-600 dark:text-[#FEF500]">
                        ${order.total.toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-700 dark:text-white/80 uppercase">
                          💵 {order.paymentMethod}
                        </span>
                      </td>

                      {/* Part 4: Inline Auto-Update Status Badge & Dropdown */}
                      <td className="px-5 py-4 relative" data-status-dropdown-container onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={isRowUpdating}
                          onClick={() =>
                            setActiveDropdownOrderId(isDropdownOpen ? null : order.id)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer hover:ring-2 hover:ring-[#18C729]/40 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} ${
                            isRowUpdating ? "opacity-60 cursor-wait" : ""
                          }`}
                          title="Click to quickly change order status"
                        >
                          {isRowUpdating ? (
                            <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          ) : null}
                          <span>{order.status}</span>
                          <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Inline Dropdown Popover */}
                        {isDropdownOpen && (
                          <div
                            className="absolute left-5 top-12 z-40 w-44 rounded-xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0c140f] p-1.5 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150"
                            role="menu"
                            aria-orientation="vertical"
                          >
                            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40 border-b border-zinc-100 dark:border-white/10">
                              Change Status
                            </div>
                            {ALL_STATUSES.map((st) => {
                              const isCurrent = order.status === st;
                              const style = STATUS_COLORS[st];
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleInlineStatusSelect(order.id, st)}
                                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                                    isCurrent
                                      ? "bg-zinc-100 dark:bg-white/10 font-bold"
                                      : "hover:bg-zinc-100 dark:hover:bg-white/5"
                                  }`}
                                >
                                  <span className={style.text}>{st}</span>
                                  {isCurrent && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(order.id)}
                          className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#060b08]">
            <p className="text-xs text-zinc-500 dark:text-white/50">
              Showing <span className="text-zinc-900 dark:text-white font-medium">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
              <span className="text-zinc-900 dark:text-white font-medium">{Math.min(currentPage * PAGE_SIZE, totalCount)}</span> of{" "}
              <span className="text-zinc-900 dark:text-white font-medium">{totalCount}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setCurrentPage(pNum)}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                      pNum === currentPage
                        ? "bg-[#18C729] text-black font-bold shadow-md shadow-[#18C729]/20"
                        : "border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-700 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Part 5: Floating Bulk Action Bar (When 1 or more orders are selected) */}
      {selectedOrderIds.size > 0 && (
        <div
          role="region"
          aria-label="Bulk action bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-zinc-300 dark:border-white/20 bg-white/95 dark:bg-[#0c140f]/95 px-5 py-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-2 pr-3 border-r border-zinc-200 dark:border-white/15">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#18C729] text-black text-xs font-black">
              {selectedOrderIds.size}
            </span>
            <span className="text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap">
              {selectedOrderIds.size === 1 ? "1 order selected" : `${selectedOrderIds.size} orders selected`}
            </span>
          </div>

          {/* Change Status Dropdown Trigger */}
          <div className="relative" data-bulk-dropdown-container>
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => setBulkDropdownOpen(!bulkDropdownOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-4 py-2 text-xs font-bold text-black hover:brightness-110 shadow-md shadow-[#18C729]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isBulkUpdating ? (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : null}
              <span>{isBulkUpdating ? (bulkProgress || "Updating...") : "Change Status"}</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Bulk Status Dropdown Menu */}
            {bulkDropdownOpen && (
              <div
                className="absolute bottom-12 left-0 w-44 rounded-xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0c140f] p-1.5 shadow-2xl space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                role="menu"
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40 border-b border-zinc-100 dark:border-white/10">
                  Select New Status
                </div>
                {ALL_STATUSES.map((st) => {
                  const style = STATUS_COLORS[st];
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleBulkStatusChange(st)}
                      className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-left"
                    >
                      <span className={style.text}>{st}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export Selected CSV */}
          <button
            type="button"
            onClick={handleExportSelectedCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="h-3.5 w-3.5 text-amber-500 dark:text-[#FEF500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Clear Selection */}
          <button
            type="button"
            onClick={() => setSelectedOrderIds(new Set())}
            className="rounded-xl p-2 text-zinc-400 dark:text-white/40 hover:text-zinc-700 dark:hover:text-white transition-colors"
            title="Deselect all"
            aria-label="Deselect all orders"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Details Modal */}
      {selectedOrderId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleCloseDetails}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#09100c] p-6 shadow-2xl space-y-6 text-zinc-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Order Details</span>
                  <span className="font-mono text-emerald-600 dark:text-[#FEF500]">
                    #{selectedOrderId.slice(0, 8).toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-white/50 font-mono mt-0.5">{selectedOrderId}</p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {isDetailsLoading ? (
              <div className="py-16 text-center text-zinc-400 dark:text-white/40">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 dark:border-white/20 border-t-[#18C729] mb-3" />
                <p className="font-mono text-xs">LOADING ORDER BREAKDOWN...</p>
              </div>
            ) : selectedOrderDetails ? (
              <div className="space-y-6 text-xs">
                {/* Status Card with inline selector */}
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-white/40 tracking-wider">
                        Current Fulfillment Status
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            (STATUS_COLORS[selectedOrderDetails.status] || STATUS_COLORS.pending).bg
                          } ${(STATUS_COLORS[selectedOrderDetails.status] || STATUS_COLORS.pending).text} ${
                            (STATUS_COLORS[selectedOrderDetails.status] || STATUS_COLORS.pending).border
                          }`}
                        >
                          {selectedOrderDetails.status}
                        </span>
                      </div>
                    </div>

                    {/* Quick status dropdown within modal */}
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedOrderDetails.status}
                        onChange={(e) => handleInlineStatusSelect(selectedOrderDetails.id, e.target.value as OrderStatus)}
                        className="rounded-xl border border-zinc-300 dark:border-white/20 bg-white dark:bg-black/60 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-white dark:bg-[#09100c] text-zinc-900 dark:text-white">
                            {st.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-white/40 tracking-wider">
                      Customer Info
                    </span>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">{selectedOrderDetails.customerName}</p>
                    <p className="font-mono text-zinc-700 dark:text-white/70">{selectedOrderDetails.phone}</p>
                    {selectedOrderDetails.email && (
                      <p className="text-zinc-500 dark:text-white/50">{selectedOrderDetails.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-white/40 tracking-wider">
                      Delivery Address
                    </span>
                    <p className="font-medium text-zinc-900 dark:text-white">{selectedOrderDetails.address}</p>
                    <p className="font-medium text-zinc-700 dark:text-white/70">{selectedOrderDetails.city}</p>
                    {selectedOrderDetails.notes && (
                      <p className="text-[11px] text-amber-700 dark:text-[#FEF500]/80 italic mt-1">
                        Note: &quot;{selectedOrderDetails.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Purchased Items Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-white/40 tracking-wider">
                    Purchased Items ({selectedOrderDetails.items.length})
                  </span>
                  <div className="divide-y divide-zinc-200 dark:divide-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                    {selectedOrderDetails.items.map((it) => (
                      <div key={it.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{it.productName}</p>
                          {it.variantName && (
                            <p className="text-[11px] text-zinc-500 dark:text-white/50">{it.variantName}</p>
                          )}
                          <p className="text-[10px] text-zinc-400 dark:text-white/40 font-mono mt-0.5">
                            Qty: {it.quantity} × ${it.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right font-mono font-bold text-zinc-900 dark:text-white">
                          ${it.lineTotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black/40 p-4 space-y-2 font-mono">
                  <div className="flex justify-between text-zinc-600 dark:text-white/60">
                    <span>Subtotal</span>
                    <span>${selectedOrderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-white/60">
                    <span>Shipping</span>
                    <span>${selectedOrderDetails.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-white/60">
                    <span>Payment Method</span>
                    <span className="uppercase">{selectedOrderDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-white/10">
                    <span>Total Due</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-[#FEF500]">
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
