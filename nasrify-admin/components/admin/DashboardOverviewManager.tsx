"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { AnalyticsKpiResponse, SmartNotification } from "@/lib/analytics";
import { fetchWithClientCache } from "@/lib/client-cache";

interface DashboardData {
  counts: {
    totalProducts: number;
    totalCategories: number;
    totalMedia: number;
    totalSettings: number;
  };
  analyticsKpis: AnalyticsKpiResponse | null;
  smartInsights: SmartNotification[];
  admin: {
    email: string;
    role: string;
  };
}

export default function DashboardOverviewManager(): React.JSX.Element {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (forceRefresh: unknown = false) => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchWithClientCache<any>("/api/admin/dashboard", {
        ttlMs: 20000,
        forceRefresh: forceRefresh === true,
      });
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load dashboard metrics");
      }
    } catch (err) {
      setError("Network connection error. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalProducts = data?.counts?.totalProducts ?? 0;
  const totalCategories = data?.counts?.totalCategories ?? 0;
  const totalMedia = data?.counts?.totalMedia ?? 0;
  const totalSettings = data?.counts?.totalSettings ?? 0;
  const analyticsKpis = data?.analyticsKpis ?? null;
  const smartInsights = data?.smartInsights ?? [];
  const primaryInsight = smartInsights[0] ?? null;

  const statCards = [
    {
      title: "Total Products",
      value: totalProducts,
      desc: "Live catalog items in D1",
      badge: "D1 Connected",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      accent: "#960DF2",
      href: "/admin/products",
    },
    {
      title: "Active Categories",
      value: totalCategories,
      desc: "Taxonomy groupings",
      badge: "Relational",
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
      accent: "#AB3DF5",
      href: "/admin/categories",
    },
    {
      title: "Stored Media Assets",
      value: totalMedia,
      desc: "Managed in Cloudflare R2",
      badge: "R2 Active",
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
      accent: "#960DF2",
      href: "/admin/media",
    },
    {
      title: "System Settings",
      value: totalSettings,
      desc: "Key-value configuration entries",
      badge: "Synchronized",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      accent: "#AB3DF5",
      href: "/admin/settings",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Shell */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-200/60 dark:border-purple-800/40 bg-white dark:bg-[#3C0561] p-6 shadow-xl">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                Store Operations Dashboard
              </h1>
              <span className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-300">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                D1 + R2 Live
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-purple-200/70">
              Real-time telemetry, order fulfillment, and predictive pattern insights.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 rounded-xl bg-[#960DF2] px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-purple-500/20 hover:bg-[#780AC2] transition-all transform hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Full Analytics & Insights</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Fallback with Retry */}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            className="font-bold underline hover:text-red-700 dark:hover:text-white"
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* 3 Mini KPI Widgets (Skeleton or Real) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-purple-300/80">
            Live Sales Performance (Last 30 Days)
          </h2>
          <Link
            href="/admin/analytics"
            className="text-xs font-semibold text-purple-600 dark:text-purple-300 hover:underline"
          >
            Detailed Analytics &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-purple-200/50 dark:border-purple-800/40 bg-white dark:bg-[#3C0561]/60 p-5 shadow-sm animate-pulse flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 w-24 bg-purple-200/50 dark:bg-purple-800/50 rounded" />
                  <div className="h-7 w-7 bg-purple-200/50 dark:bg-purple-800/50 rounded-lg" />
                </div>
                <div className="h-6 w-32 bg-purple-200/50 dark:bg-purple-800/50 rounded" />
                <div className="h-2.5 w-40 bg-purple-200/50 dark:bg-purple-800/50 rounded" />
              </div>
            ))}
          </div>
        ) : analyticsKpis ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* KPI 1: Total Revenue */}
            <div className="rounded-2xl border border-purple-200/60 dark:border-purple-800/40 bg-white dark:bg-[#3C0561]/60 p-5 shadow-sm transition-all hover:border-purple-400">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-purple-300/80">
                  Total Revenue
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {analyticsKpis.revenue.formatted}
                </span>
                <span className={`text-xs font-bold ${analyticsKpis.revenue.direction === "up" ? "text-purple-600 dark:text-purple-300" : "text-rose-500"}`}>
                  {analyticsKpis.revenue.direction === "up" ? "↑" : "↓"} {Math.abs(analyticsKpis.revenue.changePercent)}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-purple-200/60">
                vs. prior 30-day period ({analyticsKpis.revenue.prevFormatted})
              </p>
            </div>

            {/* KPI 2: Total Orders */}
            <div className="rounded-2xl border border-purple-200/60 dark:border-purple-800/40 bg-white dark:bg-[#3C0561]/60 p-5 shadow-sm transition-all hover:border-purple-400">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-purple-300/80">
                  Total Orders
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {analyticsKpis.orders.formatted}
                </span>
                <span className={`text-xs font-bold ${analyticsKpis.orders.direction === "up" ? "text-purple-600 dark:text-purple-300" : "text-rose-500"}`}>
                  {analyticsKpis.orders.direction === "up" ? "↑" : "↓"} {Math.abs(analyticsKpis.orders.changePercent)}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-purple-200/60">
                Completed & active checkouts in D1
              </p>
            </div>

            {/* KPI 3: Average Order Value */}
            <div className="rounded-2xl border border-purple-200/60 dark:border-purple-800/40 bg-white dark:bg-[#3C0561]/60 p-5 shadow-sm transition-all hover:border-purple-400">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-purple-300/80">
                  Average Order Value (AOV)
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {analyticsKpis.aov.formatted}
                </span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-300">
                  Healthy Basket
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-purple-200/60">
                Avg spend per customer checkout
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Today's Smart Insights Preview Card */}
      {loading ? (
        <div className="h-24 rounded-2xl border border-purple-200/50 dark:border-purple-800/40 bg-white dark:bg-[#3C0561]/60 p-5 animate-pulse" />
      ) : primaryInsight ? (
        <div className="rounded-2xl border border-purple-300/40 dark:border-purple-700/60 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent p-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {primaryInsight.title}
                  </h3>
                  <span className="rounded-md border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-300">
                    {primaryInsight.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-purple-200/80 max-w-2xl leading-relaxed">
                  {primaryInsight.description}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Link
                href="/admin/analytics"
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-purple-900/30 px-3.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-800/50 transition-colors"
              >
                <span>Explore Patterns</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Real Statistics Grid (Catalog Objects) */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-purple-300/80">
          Catalog & Assets Inventory
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl border border-purple-200/50 dark:border-purple-800/40 bg-white dark:bg-[#3C0561]/60 p-5 shadow-sm animate-pulse flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 w-20 bg-purple-200/50 dark:bg-purple-800/50 rounded" />
                  <div className="h-8 w-8 bg-purple-200/50 dark:bg-purple-800/50 rounded-lg" />
                </div>
                <div className="h-7 w-16 bg-purple-200/50 dark:bg-purple-800/50 rounded" />
                <div className="h-2.5 w-32 bg-purple-200/50 dark:bg-purple-800/50 rounded" />
              </div>
            ))
          ) : (
            statCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl border border-purple-200/60 dark:border-purple-800/40 bg-white dark:bg-[#3C0561]/60 p-5 shadow-sm transition-all hover:border-purple-400 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-purple-300/80">
                    {card.title}
                  </span>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40 transition-transform group-hover:scale-110"
                    style={{ color: card.accent }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                    </svg>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {card.value}
                  </span>
                  <span className="rounded-md bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-300">
                    {card.badge}
                  </span>
                </div>

                <p className="mt-2 text-xs text-zinc-500 dark:text-purple-200/60">
                  {card.desc}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Foundational Navigation Slots */}
      <div className="rounded-2xl border border-purple-200/60 dark:border-purple-800/40 bg-white dark:bg-[#3C0561] p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-purple-200">
          Admin Modules
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            href="/admin/analytics"
            className="flex flex-col items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/10 p-4 text-center text-xs hover:border-purple-500 hover:bg-purple-500/20 transition-all"
          >
            <div className="h-2 w-2 rounded-full bg-[#960DF2] mb-2 animate-ping" />
            <span className="font-bold text-purple-600 dark:text-purple-300">Analytics</span>
            <span className="text-[10px] text-purple-500 dark:text-purple-300 mt-1 font-semibold">Live Insights</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex flex-col items-center justify-center rounded-xl border border-purple-200/60 dark:border-purple-800/40 bg-purple-50/40 dark:bg-purple-950/20 p-4 text-center text-xs text-zinc-700 dark:text-white hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition-all"
          >
            <div className="h-2 w-2 rounded-full bg-[#960DF2] mb-2" />
            <span className="font-semibold text-zinc-900 dark:text-white">Products</span>
            <span className="text-[10px] text-zinc-500 dark:text-purple-300/70 mt-1">Catalog</span>
          </Link>

          <Link
            href="/admin/categories"
            className="flex flex-col items-center justify-center rounded-xl border border-purple-200/60 dark:border-purple-800/40 bg-purple-50/40 dark:bg-purple-950/20 p-4 text-center text-xs text-zinc-700 dark:text-white hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition-all"
          >
            <div className="h-2 w-2 rounded-full bg-[#960DF2] mb-2" />
            <span className="font-semibold text-zinc-900 dark:text-white">Categories</span>
            <span className="text-[10px] text-zinc-500 dark:text-purple-300/70 mt-1">Taxonomy</span>
          </Link>

          {["Orders", "Customers", "Settings"].map((mod) => (
            <Link
              key={mod}
              href={`/admin/${mod.toLowerCase()}`}
              className="flex flex-col items-center justify-center rounded-xl border border-purple-200/60 dark:border-purple-800/40 bg-purple-50/40 dark:bg-purple-950/20 p-4 text-center text-xs text-zinc-700 dark:text-white hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition-all"
            >
              <div className="h-2 w-2 rounded-full bg-purple-400 dark:bg-purple-600 mb-2" />
              <span className="font-semibold text-zinc-900 dark:text-white">{mod}</span>
              <span className="text-[10px] text-zinc-500 dark:text-purple-300/70 mt-1">Ready</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
