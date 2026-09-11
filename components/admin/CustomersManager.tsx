"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { CustomerRecord, CustomersSummary } from "@/lib/customers";

export default function CustomersManager(): React.JSX.Element {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [summary, setSummary] = useState<CustomersSummary>({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchCustomers = useCallback(async (searchQuery = "", pageToFetch = currentPage) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(pageToFetch));

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const json = (await res.json()) as {
        success: boolean;
        data?: {
          customers: CustomerRecord[];
          summary: CustomersSummary;
          total?: number;
          totalPages?: number;
          page?: number;
        };
        error?: string;
      };

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load customer records.");
      }

      if (json.data) {
        setCustomers(json.data.customers || []);
        setTotalCount(json.data.total || json.data.customers.length);
        if (!searchQuery) {
          setSummary(json.data.summary);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading customers");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, PAGE_SIZE]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search, currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, currentPage, fetchCustomers]);

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
            Real-time customer directory and lifetime value aggregated from D1 orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchCustomers(search)}
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
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-white/40">Unique purchasing profiles</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-white/50">Total Orders Placed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-[#FEF500]/15 text-amber-600 dark:text-[#FEF500]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">{summary.totalOrders}</div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-white/40">Across all customers</p>
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
          <div className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">${summary.totalRevenue.toFixed(2)}</div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-white/40">Cumulative gross order volume</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-4 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-white/50">Avg Order Value</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">${summary.averageOrderValue.toFixed(2)}</div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-white/40">Per customer transaction</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-3 shadow-sm dark:shadow-lg">
        <div className="relative flex-1">
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
            placeholder="Search by customer name, email, phone number, or city..."
            className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-white/5 py-2 pl-10 pr-4 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/40 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
          />
        </div>
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="rounded-lg border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 text-xs text-zinc-700 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchCustomers(search)}
            className="underline hover:text-red-600 dark:hover:text-red-300 ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* Customers Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-800 dark:text-white/80">
            <thead className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-white/50">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-semibold">Customer</th>
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
                  <td colSpan={7} className="p-12 text-center text-zinc-400 dark:text-white/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="h-6 w-6 animate-spin text-[#18C729]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Loading customer profiles from D1...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-400 dark:text-white/40">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-white/40 mb-3">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-white/70">No customers found</p>
                    <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">
                      {search ? `No customers matched "${search}".` : "Customer records will appear here as orders are placed."}
                    </p>
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
                          <div className="text-[10px] font-mono text-zinc-500 dark:text-white/40">Customer #{c.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {c.email ? (
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[160px] text-zinc-900 dark:text-white/90">{c.email}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(c.email!, `email-${c.id}`)}
                              className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors"
                              title="Copy Email"
                            >
                              {copiedId === `email-${c.id}` ? (
                                <span className="text-[10px] text-[#18C729]">✓</span>
                              ) : (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400 dark:text-white/30 italic">No email provided</span>
                        )}
                        {c.phone && (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-600 dark:text-white/60">
                            <span>{c.phone}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(c.phone, `phone-${c.id}`)}
                              className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors"
                              title="Copy Phone"
                            >
                              {copiedId === `phone-${c.id}` ? (
                                <span className="text-[10px] text-[#18C729]">✓</span>
                              ) : (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div>
                        <div className="text-zinc-900 dark:text-white/90 font-medium">{c.city || "—"}</div>
                        <div className="truncate max-w-[180px] text-[11px] text-zinc-500 dark:text-white/40">{c.address || "—"}</div>
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-white">
                        {c.totalOrders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="px-5 py-4 text-right">
                      <div className="font-mono font-bold text-emerald-600 dark:text-[#18C729]">
                        ${c.totalSpent.toFixed(2)}
                      </div>
                    </td>

                    {/* Last Order Date */}
                    <td className="px-5 py-4 text-zinc-600 dark:text-white/60 text-[11px]">
                      {formatDate(c.lastOrderDate)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders?search=${encodeURIComponent(c.phone || c.name)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-white/80 hover:border-[#18C729]/40 hover:bg-[#18C729]/10 hover:text-[#18C729] transition-all"
                      >
                        <span>Orders</span>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#060b08]">
            <p className="text-xs text-zinc-600 dark:text-white/50">
              Showing <span className="text-zinc-900 dark:text-white font-medium">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
              <span className="text-zinc-900 dark:text-white font-medium">{Math.min(currentPage * PAGE_SIZE, totalCount)}</span> of{" "}
              <span className="text-zinc-900 dark:text-white font-medium">{totalCount}</span> customers
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                        : "border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-white/70 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
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
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
