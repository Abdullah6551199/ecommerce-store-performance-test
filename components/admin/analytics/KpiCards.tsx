"use client";

import React from "react";
import type { AnalyticsKpiResponse, KpiMetric } from "@/lib/analytics";

interface KpiCardsProps {
  kpis: AnalyticsKpiResponse | null;
  loading: boolean;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 24;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible shrink-0 opacity-80"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function MetricCard({
  metric,
  icon,
  accentColor,
}: {
  metric: KpiMetric | undefined;
  icon: React.ReactNode;
  accentColor: string;
}) {
  if (!metric) return null;

  const isUp = metric.direction === "up";
  const isDown = metric.direction === "down";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/10 border-black/10 bg-[#0d1611] dark:bg-[#0d1611] bg-white p-5 shadow-lg transition-all hover:border-[#18C729]/40 hover:shadow-xl hover:shadow-[#18C729]/10">
      {/* Top row: Title and Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/60 dark:text-white/60 text-black/60">
          {metric.title}
        </span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 dark:bg-white/5 bg-black/5"
          style={{ color: accentColor }}
        >
          {icon}
        </div>
      </div>

      {/* Main Value & Sparkline */}
      <div className="mt-4 flex items-end justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white dark:text-white text-black">
          {metric.formatted}
        </span>
        {metric.sparkline && (
          <MiniSparkline data={metric.sparkline} color={accentColor} />
        )}
      </div>

      {/* Comparison badge */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <div
          className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 font-bold text-[11px] ${
            isUp
              ? "bg-[#18C729]/15 text-[#18C729]"
              : isDown
              ? "bg-red-500/15 text-red-400"
              : "bg-white/10 dark:bg-white/10 bg-black/10 text-white/60 dark:text-white/60 text-black/60"
          }`}
        >
          {isUp && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
          {isDown && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          <span>{Math.abs(metric.changePercent)}%</span>
        </div>
        <span className="text-[11px] text-white/40 dark:text-white/40 text-black/40 truncate">
          vs previous period ({metric.prevFormatted})
        </span>
      </div>
    </div>
  );
}

export default function KpiCards({ kpis, loading }: KpiCardsProps): React.JSX.Element {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-36 rounded-2xl border border-white/10 dark:border-white/10 border-black/10 bg-white/5 dark:bg-white/5 bg-black/5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* 1. Total Revenue */}
      <MetricCard
        metric={kpis.revenue}
        accentColor="#18C729"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* 2. Total Orders */}
      <MetricCard
        metric={kpis.orders}
        accentColor="#FEF500"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
      />

      {/* 3. Average Order Value (AOV) */}
      <MetricCard
        metric={kpis.aov}
        accentColor="#3b82f6"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        }
      />

      {/* 4. Total Customers */}
      <MetricCard
        metric={kpis.customers}
        accentColor="#a855f7"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />

      {/* 5. New Customers */}
      <MetricCard
        metric={kpis.newCustomers}
        accentColor="#10b981"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        }
      />

      {/* 6. Conversion Rate */}
      <MetricCard
        metric={kpis.conversionRate}
        accentColor="#f59e0b"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />
    </div>
  );
}
