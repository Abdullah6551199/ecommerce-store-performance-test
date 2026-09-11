"use client";

import React, { useState, useEffect, useCallback } from "react";
import KpiCards from "./KpiCards";
import {
  SalesTrendChart,
  CategoryPerformanceChart,
  TopProductsChart,
  OrderStatusDonutChart,
  CustomerGrowthChart,
} from "./AnalyticsCharts";
import SmartPatternInsights from "./SmartPatternInsights";
import AnalyticsTables from "./AnalyticsTables";
import type {
  AnalyticsPeriod,
  AnalyticsKpiResponse,
  SalesTrendPoint,
  CategoryPerformanceItem,
  TopProductItem,
  WeeklyPatternDay,
  MonthlyPatternDate,
  YearlyPatterns,
  SmartNotification,
} from "@/lib/analytics";

const PERIOD_OPTIONS: { id: AnalyticsPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_7_days", label: "Last 7 Days" },
  { id: "last_30_days", label: "Last 30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "this_year", label: "This Year" },
  { id: "custom", label: "Custom Range" },
];

export default function AnalyticsDashboard(): React.JSX.Element {
  const [period, setPeriod] = useState<AnalyticsPeriod>("last_30_days");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  // Analytics Data States
  const [kpis, setKpis] = useState<AnalyticsKpiResponse | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([]);
  const [categories, setCategories] = useState<CategoryPerformanceItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [weeklyPatterns, setWeeklyPatterns] = useState<WeeklyPatternDay[]>([]);
  const [monthlyPatterns, setMonthlyPatterns] = useState<MonthlyPatternDate[]>([]);
  const [yearlyPatterns, setYearlyPatterns] = useState<YearlyPatterns | null>(null);
  const [smartNotifications, setSmartNotifications] = useState<SmartNotification[]>([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ period });
      if (period === "custom" && customFrom && customTo) {
        queryParams.set("from", customFrom);
        queryParams.set("to", customTo);
      }

      const qStr = queryParams.toString();

      const fetchJson = async (url: string): Promise<any> => {
        const res = await fetch(url);
        return res.json();
      };

      const [
        kpiRes,
        trendRes,
        catRes,
        topRes,
        weeklyRes,
        monthlyRes,
        yearlyRes,
        insightsRes,
      ] = await Promise.all([
        fetchJson(`/api/admin/analytics/kpis?${qStr}`),
        fetchJson(`/api/admin/analytics/sales-trend?${qStr}`),
        fetchJson(`/api/admin/analytics/categories`),
        fetchJson(`/api/admin/analytics/top-products?${qStr}`),
        fetchJson(`/api/admin/analytics/patterns/weekly`),
        fetchJson(`/api/admin/analytics/patterns/monthly`),
        fetchJson(`/api/admin/analytics/patterns/yearly`),
        fetchJson(`/api/admin/analytics/insights/today`),
      ]);

      if (kpiRes?.success) setKpis(kpiRes.data);
      if (trendRes?.success) setSalesTrend(Array.isArray(trendRes.data) ? trendRes.data : trendRes.data?.trend || []);
      if (catRes?.success) setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.categories || []);
      if (topRes?.success) setTopProducts(Array.isArray(topRes.data) ? topRes.data : topRes.data?.products || []);
      if (weeklyRes?.success) setWeeklyPatterns(Array.isArray(weeklyRes.data) ? weeklyRes.data : weeklyRes.data?.patterns || []);
      if (monthlyRes?.success) setMonthlyPatterns(Array.isArray(monthlyRes.data) ? monthlyRes.data : monthlyRes.data?.dates || []);
      if (yearlyRes?.success) setYearlyPatterns(yearlyRes.data);
      if (insightsRes?.success) setSmartNotifications(Array.isArray(insightsRes.data) ? insightsRes.data : insightsRes.data?.insights || []);
    } catch (err) {
      console.error("[AnalyticsDashboard] Error fetching analytics data:", err);
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Export to CSV Handler
  const handleExportCsv = () => {
    setExporting(true);
    try {
      const rows: string[][] = [
        ["Apex Store Performance Test - Analytics Report"],
        ["Exported At", new Date().toISOString()],
        ["Period", period],
        [],
        ["--- KEY PERFORMANCE INDICATORS ---"],
        ["Metric", "Current Period", "Previous Period", "Percentage Change"],
        ["Total Revenue", kpis?.revenue?.formatted || "$0.00", kpis?.revenue?.prevFormatted || "$0.00", `${kpis?.revenue?.changePercent || 0}%`],
        ["Total Orders", kpis?.orders?.formatted || "0", kpis?.orders?.prevFormatted || "0", `${kpis?.orders?.changePercent || 0}%`],
        ["Average Order Value (AOV)", kpis?.aov?.formatted || "$0.00", kpis?.aov?.prevFormatted || "$0.00", `${kpis?.aov?.changePercent || 0}%`],
        ["Total Customers", kpis?.customers?.formatted || "0", kpis?.customers?.prevFormatted || "0", `${kpis?.customers?.changePercent || 0}%`],
        ["New Customers", kpis?.newCustomers?.formatted || "0", kpis?.newCustomers?.prevFormatted || "0", `${kpis?.newCustomers?.changePercent || 0}%`],
        ["Conversion Rate", kpis?.conversionRate?.formatted || "0.00%", kpis?.conversionRate?.prevFormatted || "0.00%", `${kpis?.conversionRate?.changePercent || 0}%`],
        [],
        ["--- SALES TREND ---"],
        ["Date / Interval", "Revenue ($)", "Orders"],
        ...salesTrend.map((t) => [t.label, t.revenue.toFixed(2), String(t.orders)]),
        [],
        ["--- CATEGORY PERFORMANCE ---"],
        ["Category Name", "Revenue ($)", "Units Sold", "Share (%)"],
        ...categories.map((c) => [c.categoryName, c.revenue.toFixed(2), String(c.unitsSold), `${c.percentage}%`]),
        [],
        ["--- TOP SELLING PRODUCTS ---"],
        ["Product Name", "Units Sold", "Revenue ($)", "Current Stock"],
        ...topProducts.map((p) => [p.name, String(p.unitsSold), p.revenue.toFixed(2), String(p.currentStock)]),
      ];

      const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `apex-analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating CSV export:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-white dark:text-white text-zinc-900 sm:text-3xl">
              Analytics & Intelligence
            </h1>
            <span className="flex items-center gap-1.5 rounded-full border border-[#18C729]/30 bg-[#18C729]/10 px-2.5 py-0.5 text-xs font-semibold text-[#18C729]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18C729] animate-pulse" />
              Real D1 Data
            </span>
          </div>
          <p className="mt-1 text-xs text-white/60 dark:text-white/60 text-zinc-600">
            Real-time sales telemetry, predictive weekly/monthly demand patterns, and catalog health.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 dark:border-white/10 border-zinc-300 bg-white/5 dark:bg-white/5 bg-zinc-100 px-4 py-2 text-xs font-bold text-white dark:text-white text-zinc-900 shadow-sm hover:bg-white/10 dark:hover:bg-white/10 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4 text-[#FEF500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{exporting ? "Generating CSV..." : "Export to CSV"}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 dark:border-white/10 border-zinc-300 bg-white/5 dark:bg-white/5 bg-zinc-100 p-2 text-xs font-semibold text-white/70 dark:text-white/70 text-zinc-600 hover:text-white dark:hover:text-white hover:text-zinc-900 hover:bg-white/10 transition-colors"
            title="Refresh analytics data"
            aria-label="Refresh analytics data"
          >
            <svg
              className={`h-4 w-4 ${loading ? "animate-spin text-[#18C729]" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Time Period Selector Tabs */}
      <div className="space-y-3 rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-[#0c140f] dark:bg-[#0c140f] bg-white p-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {PERIOD_OPTIONS.map((opt) => {
            const isSelected = period === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "border border-[#18C729]/50 bg-[#18C729] text-black shadow-md shadow-[#18C729]/20"
                    : "border border-white/5 dark:border-white/5 border-zinc-200 bg-white/5 dark:bg-white/5 bg-zinc-100 text-white/70 dark:text-white/70 text-zinc-700 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-zinc-200 hover:text-white dark:hover:text-white hover:text-zinc-900"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Custom Date Pickers (Shown only when 'custom' is active) */}
        {period === "custom" && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10 dark:border-white/10 border-zinc-200 text-xs">
            <label className="flex items-center gap-2 text-white/70 dark:text-white/70 text-zinc-600">
              <span>From:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-white/15 dark:border-white/15 border-zinc-300 bg-black/40 dark:bg-black/40 bg-zinc-100 px-2.5 py-1 text-white dark:text-white text-zinc-900 focus:border-[#18C729] focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-white/70 dark:text-white/70 text-zinc-600">
              <span>To:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-white/15 dark:border-white/15 border-zinc-300 bg-black/40 dark:bg-black/40 bg-zinc-100 px-2.5 py-1 text-white dark:text-white text-zinc-900 focus:border-[#18C729] focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={fetchAnalytics}
              className="rounded-lg bg-[#18C729] px-3 py-1 text-xs font-bold text-black hover:bg-[#15af24] transition-colors"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* 1. Core KPI Cards */}
      <section aria-labelledby="kpis-heading">
        <h2 id="kpis-heading" className="sr-only">Key Performance Indicators</h2>
        <KpiCards kpis={kpis} loading={loading} />
      </section>

      {/* 2. Smart Pattern Insights Engine */}
      <section aria-labelledby="insights-heading">
        <SmartPatternInsights
          weeklyPatterns={weeklyPatterns}
          monthlyPatterns={monthlyPatterns}
          yearlyPatterns={yearlyPatterns}
          smartNotifications={smartNotifications}
          loading={loading}
        />
      </section>

      {/* 3. Interactive Charts Grid */}
      <section className="space-y-6" aria-labelledby="charts-heading">
        <div className="flex items-center justify-between">
          <h2 id="charts-heading" className="text-lg font-extrabold tracking-tight text-white dark:text-white text-zinc-900">
            Performance Visualizations
          </h2>
          <span className="text-xs text-white/50 dark:text-white/50 text-zinc-500 font-mono">
            Zero-bundle SVG engine
          </span>
        </div>

        {/* Row 1: Sales Trend + Order Status Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Line Chart (2 Cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-[#0d1611] dark:bg-[#0d1611] bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white dark:text-white text-zinc-900">
                  Sales Trend (Revenue & Order Volume)
                </h3>
                <p className="text-[11px] text-white/50 dark:text-white/50 text-zinc-500">
                  Dual-axis interactive time series with hover telemetry
                </p>
              </div>
            </div>
            <SalesTrendChart data={salesTrend} />
          </div>

          {/* Donut Chart (1 Col) */}
          <div className="rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-[#0d1611] dark:bg-[#0d1611] bg-white p-5 shadow-lg">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white dark:text-white text-zinc-900">
                Order Status Distribution
              </h3>
              <p className="text-[11px] text-white/50 dark:text-white/50 text-zinc-500">
                Lifecycle breakdown across all active orders
              </p>
            </div>
            <OrderStatusDonutChart statusCounts={kpis?.statusDistribution || {}} />
          </div>
        </div>

        {/* Row 2: Top Selling Products + Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-[#0d1611] dark:bg-[#0d1611] bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white dark:text-white text-zinc-900">
                  Top Selling Products
                </h3>
                <p className="text-[11px] text-white/50 dark:text-white/50 text-zinc-500">
                  Top 10 catalog items by sales quantity
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#18C729]">
                {topProducts.length} Items
              </span>
            </div>
            <TopProductsChart data={topProducts} />
          </div>

          {/* Category Performance */}
          <div className="rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-[#0d1611] dark:bg-[#0d1611] bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white dark:text-white text-zinc-900">
                  Category Performance
                </h3>
                <p className="text-[11px] text-white/50 dark:text-white/50 text-zinc-500">
                  Revenue contribution and unit share per taxonomy
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#FEF500]">
                {categories.length} Taxonomies
              </span>
            </div>
            <CategoryPerformanceChart data={categories} />
          </div>
        </div>

        {/* Row 3: Customer Growth Area Chart */}
        <div className="rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-[#0d1611] dark:bg-[#0d1611] bg-white p-5 shadow-lg">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-white dark:text-white text-zinc-900">
              Customer Acquisition Growth
            </h3>
            <p className="text-[11px] text-white/50 dark:text-white/50 text-zinc-500">
              Cumulative unique shopper trajectory over selected timeframe
            </p>
          </div>
          <CustomerGrowthChart trendData={salesTrend} />
        </div>
      </section>

      {/* 4. Tables Section */}
      <section aria-labelledby="tables-heading">
        <h2 id="tables-heading" className="sr-only">Detailed Tables</h2>
        <AnalyticsTables
          recentOrders={kpis?.recentOrders || []}
          lowStockProducts={kpis?.lowStockProducts || []}
          categories={categories}
          loading={loading}
        />
      </section>
    </div>
  );
}
