"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { CustomerRecord, CustomerDetailRecord, CustomersSummary } from "@/lib/customers";

export default function CustomersManager(): React.JSX.Element {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [summary, setSummary] = useState<CustomersSummary>({
    totalCustomers: 0,
    registeredCustomers: 0,
    guestCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [filterType, setFilterType] = useState<"all" | "registered" | "guest">("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Detail Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<CustomerDetailRecord | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Send Notification State
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyLink, setNotifyLink] = useState("");
  const [sendingNotify, setSendingNotify] = useState(false);
  const [notifyAlert, setNotifyAlert] = useState<{ text: string; success: boolean } | null>(null);

  const fetchCustomers = useCallback(
    async (searchQuery = "", pageToFetch = currentPage, type = filterType) => {
      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (type !== "all") params.set("type", type);
        params.set("limit", String(PAGE_SIZE));
        params.set("page", String(pageToFetch));

        const res = await fetch(`/api/admin/customers?${params.toString()}`);
        const json = (await res.json()) as {
          success?: boolean;
          error?: string;
          data?: {
            customers?: CustomerRecord[];
            total?: number;
            summary?: CustomersSummary;
          };
        };

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load customer records.");
        }

        if (json.data) {
          setCustomers(json.data.customers || []);
          setTotalCount(json.data.total || (json.data.customers ? json.data.customers.length : 0));
          if (!searchQuery) {
            setSummary(json.data.summary || {
              totalCustomers: 0,
              registeredCustomers: 0,
              guestCustomers: 0,
              totalOrders: 0,
              totalRevenue: 0,
              averageOrderValue: 0,
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading customers");
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, PAGE_SIZE, filterType]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search, currentPage, filterType);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, currentPage, filterType, fetchCustomers]);

  // Open detail modal
  const openCustomerDetail = async (customerId: string) => {
    try {
      setSelectedCustomerId(customerId);
      setLoadingDetail(true);
      setNotifyOpen(false);
      setNotifyAlert(null);

      const res = await fetch(`/api/admin/customers/${customerId}`);
      const json = (await res.json()) as { success?: boolean; data?: CustomerDetailRecord };
      if (res.ok && json.success && json.data) {
        setDetailData(json.data);
      }
    } catch (err) {
      console.error("Failed to load customer detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Toggle customer account status (active/suspended)
  const handleToggleStatus = async () => {
    if (!detailData || !detailData.registeredCustomerId) return;
    const newStatus = detailData.status === "active" ? "suspended" : "active";

    try {
      setUpdatingStatus(true);
      const res = await fetch(
        `/api/admin/customers/${detailData.registeredCustomerId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        setDetailData((prev) => (prev ? { ...prev, status: newStatus } : null));
        fetchCustomers(search, currentPage, filterType);
      }
    } catch (err) {
      console.error("Failed to toggle customer status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Send custom notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailData || !detailData.registeredCustomerId) return;
    setSendingNotify(true);
    setNotifyAlert(null);

    try {
      const res = await fetch(
        `/api/admin/customers/${detailData.registeredCustomerId}/notify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: notifyTitle,
            message: notifyMessage,
            link: notifyLink || null,
          }),
        }
      );

      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to send notification");

      setNotifyAlert({ text: "Notification sent successfully!", success: true });
      setNotifyTitle("");
      setNotifyMessage("");
      setNotifyLink("");
    } catch (err: unknown) {
      setNotifyAlert({
        text: err instanceof Error ? err.message : "Error sending notification",
        success: false,
      });
    } finally {
      setSendingNotify(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Customers</h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-white/60">
            Real-time customer directory with account profiles, saved addresses, and notification dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchCustomers(search, currentPage, filterType)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-white/80 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-[#18C729]" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-white/50">Total Customers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">{summary.totalCustomers}</div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-white/40">
            {summary.registeredCustomers} registered &bull; {summary.guestCustomers} guest
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-white/50">Total Orders</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">{summary.totalOrders}</div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-white/40">Across all orders</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-white/50">Lifetime Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">Rs. {summary.totalRevenue.toLocaleString()}</div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-white/40">Cumulative gross order volume</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-white/50">Avg Order Value</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">Rs. {summary.averageOrderValue.toFixed(2)}</div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-white/40">Per customer order</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Registered vs Guest filter tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] shadow-sm">
          {(["all", "registered", "guest"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setFilterType(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition ${
                filterType === tab
                  ? "bg-[#18C729] text-black shadow-md shadow-[#18C729]/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab === "all"
                ? `All (${summary.totalCustomers})`
                : tab === "registered"
                ? `Registered (${summary.registeredCustomers})`
                : `Guest (${summary.guestCustomers})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or city..."
            className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#0c140f] py-2 pl-10 pr-4 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-[#18C729] focus:outline-none"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchCustomers(search, currentPage, filterType)}
            className="underline ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* Customers Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-800 dark:text-white/80">
            <thead className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-white/50">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-semibold">Customer</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Type / Status</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Contact</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Location</th>
                <th scope="col" className="px-5 py-3.5 font-semibold text-center">Orders</th>
                <th scope="col" className="px-5 py-3.5 font-semibold text-right">Total Spent</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Last Order</th>
                <th scope="col" className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
              {isLoading && customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="h-6 w-6 animate-spin text-[#18C729]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-zinc-400">
                    <p className="text-sm font-medium">No customers found</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#18C729]/20 to-[#FEF500]/20 font-mono text-xs font-bold text-emerald-700 dark:text-[#18C729] border border-zinc-200 dark:border-white/10">
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-white">{c.name}</div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            ID: {c.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type / Account Status */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {c.isRegistered ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#18C729]/20 text-emerald-700 dark:text-[#18C729]">
                            Registered
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                            Guest
                          </span>
                        )}

                        {c.isRegistered && (
                          <span
                            className={`text-[10px] font-semibold uppercase ${
                              c.status === "suspended" ? "text-red-500" : "text-zinc-400"
                            }`}
                          >
                            {c.status}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {c.email ? (
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[150px] text-zinc-900 dark:text-white/90">{c.email}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(c.email!, `email-${c.id}`)}
                              className="text-zinc-400 hover:text-black dark:hover:text-white"
                              title="Copy Email"
                            >
                              {copiedId === `email-${c.id}` ? "✓" : "📋"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">No email</span>
                        )}
                        {c.phone && (
                          <div className="text-[11px] font-mono text-zinc-500">{c.phone}</div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="text-zinc-900 dark:text-white font-medium">{c.city || "—"}</div>
                      <div className="truncate max-w-[150px] text-[11px] text-zinc-500">{c.address || "—"}</div>
                    </td>

                    {/* Total Orders */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 px-2.5 py-0.5 text-xs font-semibold">
                        {c.totalOrders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="px-5 py-4 text-right">
                      <div className="font-mono font-bold text-emerald-600 dark:text-[#18C729]">
                        Rs. {c.totalSpent.toFixed(2)}
                      </div>
                    </td>

                    {/* Last Order Date */}
                    <td className="px-5 py-4 text-zinc-500 text-[11px]">
                      {formatDate(c.lastOrderDate)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openCustomerDetail(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:border-[#18C729] text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-[#18C729] transition"
                      >
                        Details &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-white/10 text-xs">
            <span className="text-zinc-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 disabled:opacity-30"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail & Notification Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100 dark:border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                    {detailData?.name || "Customer Detail"}
                  </h2>
                  {detailData?.isRegistered ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18C729]/20 text-[#18C729]">
                      Registered
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-white/10 text-zinc-500">
                      Guest
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {detailData?.email || "No email"} &bull; {detailData?.phone || "No phone"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Loading detailed customer records...
              </div>
            ) : detailData ? (
              <div className="space-y-6">
                {/* Account Actions (for registered customer) */}
                {detailData.isRegistered && (
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Account Status:{" "}
                        <span
                          className={`font-black uppercase ${
                            detailData.status === "suspended" ? "text-red-500" : "text-[#18C729]"
                          }`}
                        >
                          {detailData.status}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleToggleStatus}
                        disabled={updatingStatus}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50 ${
                          detailData.status === "active"
                            ? "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                            : "bg-[#18C729]/10 text-[#18C729] hover:bg-[#18C729]/20"
                        }`}
                      >
                        {updatingStatus
                          ? "Updating..."
                          : detailData.status === "active"
                          ? "Suspend Account"
                          : "Activate Account"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setNotifyOpen(!notifyOpen)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#18C729] text-black font-extrabold text-xs hover:bg-[#15af24] transition"
                      >
                        {notifyOpen ? "Cancel Notification" : "Send In-App Notification"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Send In-App Notification Form */}
                {notifyOpen && (
                  <form
                    onSubmit={handleSendNotification}
                    className="p-5 rounded-2xl border border-[#18C729]/30 bg-[#18C729]/5 space-y-3 animate-in fade-in"
                  >
                    <h3 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
                      Compose In-App Notification
                    </h3>

                    {notifyAlert && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-semibold ${
                          notifyAlert.success
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {notifyAlert.text}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={notifyTitle}
                        onChange={(e) => setNotifyTitle(e.target.value)}
                        placeholder="e.g. Special Offer or Account Update"
                        className="w-full h-9 px-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#080e0a] text-xs text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={notifyMessage}
                        onChange={(e) => setNotifyMessage(e.target.value)}
                        placeholder="Write message delivered directly to customer header bell..."
                        className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#080e0a] text-xs text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Link URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={notifyLink}
                        onChange={(e) => setNotifyLink(e.target.value)}
                        placeholder="/shop or /account/orders"
                        className="w-full h-9 px-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#080e0a] text-xs text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={sendingNotify}
                        className="px-4 py-2 rounded-xl bg-[#18C729] text-black font-extrabold text-xs hover:bg-[#15af24] transition disabled:opacity-50"
                      >
                        {sendingNotify ? "Sending..." : "Send Notification"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Orders History */}
                <div>
                  <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Orders ({detailData.orders?.length || 0})
                  </h3>
                  {detailData.orders && detailData.orders.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {detailData.orders.map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5 text-xs"
                        >
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white">
                              #{o.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-zinc-400 ml-2">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="capitalize font-semibold">{o.status}</span>
                            <span className="font-mono font-bold text-[#18C729]">
                              Rs. {Number(o.total).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No orders found.</p>
                  )}
                </div>

                {/* Saved Addresses */}
                <div>
                  <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Addresses ({detailData.addresses?.length || 0})
                  </h3>
                  {detailData.addresses && detailData.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {detailData.addresses.map((a) => (
                        <div
                          key={a.id}
                          className="p-3 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold">{a.label}</span>
                            {a.isDefault && (
                              <span className="text-[10px] text-[#18C729] font-bold">Default</span>
                            )}
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-400">{a.address}, {a.city}</p>
                          <p className="text-zinc-400 text-[11px]">{a.phone}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No saved addresses.</p>
                  )}
                </div>

                {/* Submitted Reviews */}
                <div>
                  <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Reviews ({detailData.reviews?.length || 0})
                  </h3>
                  {detailData.reviews && detailData.reviews.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {detailData.reviews.map((r) => (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-amber-500 font-bold">{"★".repeat(r.rating)}</span>
                            <span className="capitalize font-semibold text-[10px]">{r.status}</span>
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-300">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No reviews submitted.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
