"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type {
  WeeklyPatternDay,
  MonthlyPatternDate,
  YearlyPatterns,
  SmartNotification,
} from "@/lib/analytics";

interface SmartPatternInsightsProps {
  weeklyPatterns: WeeklyPatternDay[];
  monthlyPatterns: MonthlyPatternDate[];
  yearlyPatterns: YearlyPatterns | null;
  smartNotifications: SmartNotification[];
  loading: boolean;
}

export default function SmartPatternInsights({
  weeklyPatterns,
  monthlyPatterns,
  yearlyPatterns,
  smartNotifications,
  loading,
}: SmartPatternInsightsProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "yearly" | "table">(
    "weekly"
  );
  const [tableExpanded, setTableExpanded] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5" />
        <div className="h-72 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5" />
      </div>
    );
  }

  const confidenceBadge = (confidence: "High" | "Medium" | "Low") => {
    switch (confidence) {
      case "High":
        return (
          <span className="rounded-md border border-[#18C729]/30 bg-[#18C729]/15 px-2 py-0.5 text-[10px] font-bold text-[#18C729]">
            High Confidence
          </span>
        );
      case "Medium":
        return (
          <span className="rounded-md border border-[#FEF500]/40 bg-[#FEF500]/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-[#FEF500]">
            Medium Confidence
          </span>
        );
      case "Low":
      default:
        return (
          <span className="rounded-md border border-zinc-300 dark:border-white/20 bg-zinc-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-white/70">
            Emerging Pattern
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Smart Notifications System Widget */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#18C729] to-[#FEF500] text-black shadow-md shadow-[#18C729]/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Smart Pattern Insights & Recommendations
              </h2>
              <p className="text-xs text-zinc-500 dark:text-white/50">
                Automated algorithmic recommendations synthesized from historical order velocity
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#18C729]/10 px-3 py-1 text-[11px] font-mono font-bold text-[#18C729] border border-[#18C729]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#18C729] animate-pulse" />
            Active Engine
          </span>
        </div>

        {/* Notifications Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {smartNotifications.map((note) => (
            <div
              key={note.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-4 transition-all hover:border-[#18C729]/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {note.title}
                  </span>
                  <span className="rounded bg-[#18C729]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#18C729]">
                    {note.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed">
                  {note.description}
                </p>
              </div>

              {note.actionText && note.actionUrl && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/5">
                  <Link
                    href={note.actionUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#18C729] hover:underline"
                  >
                    <span>{note.actionText}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Pattern Tabs & Sub-Sections */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 shadow-xl space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black/30 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("weekly")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "weekly"
                  ? "bg-[#18C729] text-black shadow"
                  : "text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              🗓️ Weekly Patterns (Mon–Sun)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("monthly")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "monthly"
                  ? "bg-[#18C729] text-black shadow"
                  : "text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              📅 Monthly Recurring (Next 14 Days)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("yearly")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "yearly"
                  ? "bg-[#18C729] text-black shadow"
                  : "text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              📈 Yearly Peaks
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTableExpanded(!tableExpanded)}
            className="text-xs font-semibold text-zinc-600 dark:text-white/60 hover:text-[#18C729] transition-colors inline-flex items-center gap-1"
          >
            <span>{tableExpanded ? "Hide Pattern Matrix" : "View Pattern Matrix"}</span>
            <svg
              className={`h-4 w-4 transform transition-transform ${tableExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Tab Content A: Weekly Patterns Grid */}
        {activeTab === "weekly" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-white/50">
                Top predicted products for each day of the week based on 4-week historical sales
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
              {weeklyPatterns.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                    day.isToday
                      ? "border-[#18C729] bg-[#18C729]/10 shadow-lg shadow-[#18C729]/15 ring-1 ring-[#18C729]"
                      : "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] hover:border-zinc-300 dark:hover:border-white/20"
                  }`}
                >
                  {/* Day header & Today badge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                        {day.dayName}
                      </span>
                      {day.isToday ? (
                        <span className="rounded bg-[#18C729] px-1.5 py-0.5 text-[9px] font-black uppercase text-black animate-pulse">
                          Today
                        </span>
                      ) : (
                        confidenceBadge(day.confidence)
                      )}
                    </div>

                    {/* Product Thumbnail & Details */}
                    <div className="my-2.5 flex items-center gap-2.5">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black/40">
                        <Image
                          src={day.imageUrl}
                          alt={day.topProductName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-zinc-900 dark:text-white" title={day.topProductName}>
                          {day.topProductName}
                        </p>
                        <p className="font-mono text-[10px] text-[#18C729]">
                          {day.unitsSold} units (last period)
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-600 dark:text-white/60 line-clamp-2 leading-tight">
                      {day.recommendation}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-3.5 pt-2.5 border-t border-zinc-200 dark:border-white/5 flex items-center gap-2">
                    <Link
                      href={`/admin/products`}
                      className="flex-1 text-center rounded-lg border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/5 py-1 text-[10px] font-bold text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                    >
                      View Product
                    </Link>
                    <Link
                      href={`/admin/homepage`}
                      className="flex-1 text-center rounded-lg bg-[#18C729]/20 text-emerald-700 dark:text-[#18C729] border border-[#18C729]/30 py-1 text-[10px] font-bold hover:bg-[#18C729]/30 transition-colors"
                    >
                      Promote
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content B: Monthly Patterns */}
        {activeTab === "monthly" && (
          <div className="space-y-4">
            <span className="text-xs text-zinc-500 dark:text-white/50">
              Recurring day-of-month spikes expected in the next 14 calendar days
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {monthlyPatterns.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-extrabold text-amber-600 dark:text-[#FEF500]">
                        {item.dateString}
                      </span>
                      {confidenceBadge(item.confidence)}
                    </div>
                    <div className="mt-2.5">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">
                        {item.predictedProduct}
                      </span>
                      <span className="text-[11px] font-mono text-[#18C729]">
                        ~{item.historicalUnits} units expected
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-white/60">
                      {item.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-zinc-200 dark:border-white/5">
                    <Link
                      href="/admin/products"
                      className="text-[11px] font-bold text-[#18C729] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Prepare Inventory</span>
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content C: Yearly Peaks */}
        {activeTab === "yearly" && yearlyPatterns && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-white/50">
                Peak Sales Month
              </span>
              <p className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-white">
                {yearlyPatterns.bestMonth.name}
              </p>
              <p className="mt-1 text-xs font-mono text-[#18C729] font-bold">
                ${yearlyPatterns.bestMonth.revenue.toLocaleString()} recorded
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-white/50">
                Top Performing Week
              </span>
              <p className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-white">
                {yearlyPatterns.bestWeek.description}
              </p>
              <p className="mt-1 text-xs font-mono text-amber-600 dark:text-[#FEF500] font-bold">
                ${yearlyPatterns.bestWeek.revenue.toLocaleString()} volume
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-white/50">
                Top Product of the Year
              </span>
              <p className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-white truncate">
                {yearlyPatterns.topProduct.name}
              </p>
              <p className="mt-1 text-xs font-mono text-[#18C729] font-bold">
                {yearlyPatterns.topProduct.unitsSold} units (${yearlyPatterns.topProduct.revenue.toLocaleString()})
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-white/50">
                Top Revenue Category
              </span>
              <p className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-white">
                {yearlyPatterns.topCategory.name}
              </p>
              <p className="mt-1 text-xs font-mono text-[#3b82f6] font-bold">
                ${yearlyPatterns.topCategory.revenue.toLocaleString()} category total
              </p>
            </div>
          </div>
        )}

        {/* Section 2.5: Expandable Detailed Data Table */}
        {tableExpanded && (
          <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80 mb-3">
              Weekly Pattern Intelligence Matrix
            </h3>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
              <table className="w-full text-left text-xs text-zinc-700 dark:text-white/80">
                <thead className="bg-zinc-100 dark:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-white/50">
                  <tr>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Predicted Top Product</th>
                    <th className="px-4 py-3">Last Period Sales</th>
                    <th className="px-4 py-3">Confidence Level</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                  {weeklyPatterns.map((day) => (
                    <tr key={day.dayOfWeek} className={day.isToday ? "bg-[#18C729]/5" : ""}>
                      <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">
                        {day.dayName} {day.isToday && "(Today)"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-white/90">
                        {day.topProductName}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#18C729]">
                        {day.unitsSold} units
                      </td>
                      <td className="px-4 py-3">
                        {confidenceBadge(day.confidence)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href="/admin/products"
                          className="font-bold text-[#18C729] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
