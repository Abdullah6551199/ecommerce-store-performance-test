import React from "react";
import Link from "next/link";
import { getDb, products, categories, media, settings } from "@/lib/db";
import { count } from "drizzle-orm";
import {
  getAnalyticsKpis,
  getTodaySmartInsights,
  type AnalyticsKpiResponse,
  type SmartNotification,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
  const db = getDb();
  let totalProducts = 0;
  let totalCategories = 0;
  let totalMedia = 0;
  let totalSettings = 0;

  if (db) {
    try {
      const [prodRes, catRes, mediaRes, setRes] = await Promise.all([
        db.select({ value: count() }).from(products),
        db.select({ value: count() }).from(categories),
        db.select({ value: count() }).from(media),
        db.select({ value: count() }).from(settings),
      ]);
      totalProducts = prodRes[0]?.value || 0;
      totalCategories = catRes[0]?.value || 0;
      totalMedia = mediaRes[0]?.value || 0;
      totalSettings = setRes[0]?.value || 0;
    } catch (err) {
      console.warn("[Admin Dashboard] Error querying D1 metrics:", err);
    }
  }

  // Fetch real analytics KPIs and today's smart insights
  let analyticsKpis: AnalyticsKpiResponse | null = null;
  let smartInsights: SmartNotification[] = [];
  try {
    const [kpiData, insightsData] = await Promise.all([
      getAnalyticsKpis("last_30_days"),
      getTodaySmartInsights(),
    ]);
    analyticsKpis = kpiData;
    smartInsights = insightsData.insights || [];
  } catch (err) {
    console.warn("[Admin Dashboard] Error querying analytics data:", err);
  }

  const statCards = [
    {
      title: "Total Products",
      value: totalProducts,
      desc: "Live catalog items in D1",
      badge: "D1 Connected",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      accent: "#18C729",
      href: "/admin/products",
    },
    {
      title: "Active Categories",
      value: totalCategories,
      desc: "Taxonomy groupings",
      badge: "Relational",
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
      accent: "#FEF500",
      href: "/admin/categories",
    },
    {
      title: "Stored Media Assets",
      value: totalMedia,
      desc: "Managed in Cloudflare R2",
      badge: "R2 Active",
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
      accent: "#18C729",
      href: "/admin/media",
    },
    {
      title: "System Settings",
      value: totalSettings,
      desc: "Key-value configuration entries",
      badge: "Synchronized",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      accent: "#FEF500",
      href: "/admin/settings",
    },
  ];

  const primaryInsight = smartInsights[0] || null;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Shell with Link to Analytics */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0f1a13] p-6 shadow-xl">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                Store Operations Dashboard
              </h1>
              <span className="flex items-center gap-1.5 rounded-full bg-[#18C729]/10 px-2.5 py-0.5 text-xs font-semibold text-[#18C729]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18C729] animate-pulse" />
                D1 + R2 Live
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-white/60">
              Real-time telemetry, order fulfillment, and predictive pattern insights.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 rounded-xl bg-[#18C729] px-4 py-2 text-xs font-extrabold text-black shadow-lg shadow-[#18C729]/20 hover:bg-[#15af24] transition-all transform hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Full Analytics & Insights</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Part 4.2: 3 Mini KPI Widgets for Store Telemetry */}
      {analyticsKpis && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-white/60">
              Live Sales Performance (Last 30 Days)
            </h2>
            <Link
              href="/admin/analytics"
              className="text-xs font-semibold text-[#18C729] hover:underline"
            >
              Detailed Analytics &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* KPI 1: Total Revenue */}
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-5 shadow-sm transition-all hover:border-[#18C729]/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-white/60">
                  Total Revenue
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#18C729]/15 text-[#18C729]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {analyticsKpis.revenue.formatted}
                </span>
                <span className={`text-xs font-bold ${analyticsKpis.revenue.direction === "up" ? "text-[#18C729]" : "text-rose-500"}`}>
                  {analyticsKpis.revenue.direction === "up" ? "↑" : "↓"} {Math.abs(analyticsKpis.revenue.changePercent)}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-white/40">
                vs. prior 30-day period ({analyticsKpis.revenue.prevFormatted})
              </p>
            </div>

            {/* KPI 2: Total Orders */}
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-5 shadow-sm transition-all hover:border-[#18C729]/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-white/60">
                  Total Orders
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF500]/15 text-[#c4bd00] dark:text-[#FEF500]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {analyticsKpis.orders.formatted}
                </span>
                <span className={`text-xs font-bold ${analyticsKpis.orders.direction === "up" ? "text-[#18C729]" : "text-rose-500"}`}>
                  {analyticsKpis.orders.direction === "up" ? "↑" : "↓"} {Math.abs(analyticsKpis.orders.changePercent)}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-white/40">
                Completed & active checkouts in D1
              </p>
            </div>

            {/* KPI 3: Average Order Value */}
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-5 shadow-sm transition-all hover:border-[#18C729]/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-white/60">
                  Average Order Value (AOV)
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {analyticsKpis.aov.formatted}
                </span>
                <span className="text-xs font-bold text-[#18C729]">
                  Healthy Basket
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-white/40">
                Avg spend per customer checkout
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Part 4.2: Today's Smart Insights Preview Card */}
      {primaryInsight && (
        <div className="rounded-2xl border border-[#18C729]/30 bg-gradient-to-r from-[#18C729]/10 via-[#FEF500]/5 to-transparent p-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#18C729]/20 text-[#18C729]">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {primaryInsight.title}
                  </h3>
                  <span className="rounded-md border border-[#18C729]/40 bg-[#18C729]/20 px-2 py-0.5 text-[10px] font-bold text-[#18C729]">
                    {primaryInsight.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-white/70 max-w-2xl leading-relaxed">
                  {primaryInsight.description}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Link
                href="/admin/analytics"
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/20 transition-colors"
              >
                <span>Explore Patterns</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Real Statistics Grid (Catalog Objects) */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-white/60">
          Catalog & Assets Inventory
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-5 shadow-sm transition-all hover:border-[#18C729]/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-white/60">
                  {card.title}
                </span>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/5 transition-transform group-hover:scale-110"
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
                <span className="rounded-md bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#18C729]">
                  {card.badge}
                </span>
              </div>

              <p className="mt-2 text-xs text-zinc-500 dark:text-white/40">
                {card.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Foundational Navigation Slots */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">
          Admin Modules
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            href="/admin/analytics"
            className="flex flex-col items-center justify-center rounded-xl border border-[#18C729]/40 bg-[#18C729]/10 p-4 text-center text-xs hover:border-[#18C729] hover:bg-[#18C729]/20 transition-all"
          >
            <div className="h-2 w-2 rounded-full bg-[#18C729] mb-2 animate-ping" />
            <span className="font-bold text-[#18C729]">Analytics</span>
            <span className="text-[10px] text-amber-600 dark:text-[#FEF500] mt-1 font-semibold">Stage 13 New</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] p-4 text-center text-xs text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
          >
            <div className="h-2 w-2 rounded-full bg-[#18C729] mb-2" />
            <span className="font-semibold text-zinc-900 dark:text-white">Products</span>
            <span className="text-[10px] text-zinc-500 dark:text-white/40 mt-1">Catalog</span>
          </Link>

          <Link
            href="/admin/categories"
            className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] p-4 text-center text-xs text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
          >
            <div className="h-2 w-2 rounded-full bg-[#18C729] mb-2" />
            <span className="font-semibold text-zinc-900 dark:text-white">Categories</span>
            <span className="text-[10px] text-zinc-500 dark:text-white/40 mt-1">Taxonomy</span>
          </Link>

          {["Orders", "Customers", "Settings"].map((mod) => (
            <Link
              key={mod}
              href={`/admin/${mod.toLowerCase()}`}
              className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] p-4 text-center text-xs text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
            >
              <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-white/30 mb-2" />
              <span className="font-semibold text-zinc-900 dark:text-white">{mod}</span>
              <span className="text-[10px] text-zinc-500 dark:text-white/40 mt-1">Ready</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
