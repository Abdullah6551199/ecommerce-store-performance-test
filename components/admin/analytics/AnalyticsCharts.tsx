"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { SalesTrendPoint, CategoryPerformanceItem, TopProductItem } from "@/lib/analytics";

interface AnalyticsChartsProps {
  salesTrend: SalesTrendPoint[];
  categories: CategoryPerformanceItem[];
  topProducts: TopProductItem[];
  loading: boolean;
}

/**
 * Chart 1: Sales Trend (Interactive Line Chart with Dual-Axis & Tooltip)
 */
export function SalesTrendChart({ data }: { data: SalesTrendPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-zinc-500 dark:text-white/40">
        No sales trend data available for this period.
      </div>
    );
  }

  const maxRev = Math.max(...data.map((d) => d.revenue), 100);
  const maxOrders = Math.max(...data.map((d) => d.orders), 5);

  const width = 800;
  const height = 260;
  const padLeft = 55;
  const padRight = 45;
  const padTop = 20;
  const padBottom = 40;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const revPoints = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padTop + chartHeight - (d.revenue / maxRev) * chartHeight;
    return { x, y, ...d };
  });

  const orderPoints = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padTop + chartHeight - (d.orders / maxOrders) * chartHeight;
    return { x, y, ...d };
  });

  const revLine = revPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const revArea = `${revPoints[0].x},${padTop + chartHeight} ${revLine} ${revPoints[revPoints.length - 1].x},${padTop + chartHeight}`;
  const orderLine = orderPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const hoveredPoint = hoveredIdx !== null ? revPoints[hoveredIdx] : null;

  return (
    <div className="relative">
      {/* Legend */}
      <div className="mb-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#18C729]" />
            <span className="font-semibold text-zinc-700 dark:text-white/80">Revenue ($)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#FEF500]" />
            <span className="font-semibold text-zinc-700 dark:text-white/80">Orders</span>
          </div>
        </div>
        {hoveredPoint && (
          <div className="font-mono text-xs font-bold text-[#18C729]">
            {hoveredPoint.label}: ${hoveredPoint.revenue.toFixed(2)} ({hoveredPoint.orders} orders)
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px]"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18C729" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#18C729" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + chartHeight * pct;
            const revVal = (maxRev * (1 - pct)).toFixed(0);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-white/10"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="currentColor"
                  className="text-zinc-400 dark:text-white/40"
                  fontFamily="monospace"
                >
                  ${revVal}
                </text>
              </g>
            );
          })}

          {/* Revenue Area Fill */}
          <polygon points={revArea} fill="url(#revGrad)" />

          {/* Revenue Line */}
          <polyline
            fill="none"
            stroke="#18C729"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={revLine}
          />

          {/* Orders Secondary Line */}
          <polyline
            fill="none"
            stroke="#FEF500"
            strokeWidth={2}
            strokeDasharray="5 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={orderLine}
          />

          {/* Data Points and Interaction Bars */}
          {revPoints.map((p, i) => (
            <g key={i}>
              {/* Invisible wide hover target */}
              <rect
                x={p.x - chartWidth / (data.length * 2)}
                y={padTop}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                className="cursor-pointer"
              />

              {/* Point dots */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 6 : 3}
                fill="#18C729"
                stroke="#080e0a"
                strokeWidth={2}
                className="transition-all"
              />

              {/* X Axis labels (show subset to prevent overlap) */}
              {(data.length <= 14 || i % Math.ceil(data.length / 10) === 0) && (
                <text
                  x={p.x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="text-zinc-500 dark:text-white/50"
                  fontFamily="monospace"
                >
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/**
 * Chart 2: Category Performance (Vertical Bar Chart)
 */
export function CategoryPerformanceChart({ data }: { data: CategoryPerformanceItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-xs text-zinc-500 dark:text-white/40">
        No category revenue data available.
      </div>
    );
  }

  const maxRev = Math.max(...data.map((c) => c.revenue), 10);

  return (
    <div className="space-y-3">
      {data.map((cat) => {
        const pct = Math.max(8, (cat.revenue / maxRev) * 100);
        return (
          <div key={cat.categoryId} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-800 dark:text-white/90">
                {cat.categoryName}
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[#18C729] font-bold">${cat.revenue.toFixed(2)}</span>
                <span className="text-zinc-500 dark:text-white/40 text-[10px]">
                  ({cat.unitsSold} units • {cat.percentage}%)
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#18C729] to-[#FEF500] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Chart 3: Top Selling Products (Horizontal Bar Chart with Thumbnails)
 */
export function TopProductsChart({ data }: { data: TopProductItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-zinc-500 dark:text-white/40">
        No product sales recorded in this period.
      </div>
    );
  }

  const maxUnits = Math.max(...data.map((p) => p.unitsSold), 1);

  return (
    <div className="space-y-3">
      {data.map((prod, idx) => {
        const barWidth = Math.max(5, (prod.unitsSold / maxUnits) * 100);
        return (
          <div
            key={prod.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] p-2.5 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            {/* Rank badge */}
            <span className="w-5 text-center font-mono text-xs font-extrabold text-zinc-400 dark:text-white/40">
              #{idx + 1}
            </span>

            {/* Thumbnail */}
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black/40">
              <Image
                src={prod.imageUrl}
                alt={prod.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>

            {/* Info & Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-zinc-900 dark:text-white">
                  {prod.name}
                </span>
                <span className="shrink-0 font-mono text-xs font-bold text-[#18C729]">
                  {prod.unitsSold} sold
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#18C729] to-[#3de34d] transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500 dark:text-white/50 font-mono">
                <span>Stock: {prod.currentStock} left</span>
                <span>Revenue: ${prod.revenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Chart 4: Order Status Distribution (Donut Chart)
 * PART 3 FIX: Compact layout, truncated labels with tooltips, no label overflow!
 */
export function OrderStatusDonutChart({
  statusCounts,
}: {
  statusCounts: Record<string, number>;
}) {
  const statusConfig: Record<string, { label: string; shortLabel: string; color: string }> = {
    delivered: { label: "Delivered", shortLabel: "Deliv.", color: "#18C729" },
    shipped: { label: "Shipped", shortLabel: "Ship.", color: "#3de34d" },
    processing: { label: "Processing", shortLabel: "Proc.", color: "#FEF500" },
    confirmed: { label: "Confirmed", shortLabel: "Conf.", color: "#3b82f6" },
    pending: { label: "Pending", shortLabel: "Pend.", color: "#f59e0b" },
    cancelled: { label: "Cancelled", shortLabel: "Canc.", color: "#ef4444" },
  };

  const total = Object.values(statusCounts).reduce((s, c) => s + c, 0) || 1;

  // Compute SVG stroke-dasharray segments for donut
  let cumulativePercent = 0;
  const segments = Object.entries(statusConfig).map(([statusKey, config]) => {
    const count = statusCounts[statusKey] || 0;
    const percent = count / total;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return {
      statusKey,
      label: config.label,
      shortLabel: config.shortLabel,
      color: config.color,
      count,
      percent: Math.round(percent * 100),
      startPercent: start,
    };
  });

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-around gap-6 py-2">
      {/* SVG Donut */}
      <div className="relative h-40 w-40 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          {segments.map((seg) => {
            const strokeDasharray = `${seg.percent === 0 ? 0 : circumference * (seg.count / total)} ${circumference}`;
            const strokeDashoffset = -circumference * seg.startPercent;
            return (
              <circle
                key={seg.statusKey}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={16}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="font-mono text-2xl font-extrabold text-zinc-900 dark:text-white">
            {total}
          </span>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-white/50">
            Total Orders
          </span>
        </div>
      </div>

      {/* Legend list (Clean Grid, Truncated + Tooltips, within bounds) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-x-4 gap-y-2.5 text-xs w-full max-w-sm">
        {segments.map((seg) => (
          <div
            key={seg.statusKey}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-default"
            title={`${seg.label}: ${seg.count} orders (${seg.percent}%)`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: seg.color }}
            />
            <div className="flex items-baseline justify-between gap-1.5 min-w-0 flex-1">
              <span className="text-zinc-600 dark:text-white/70 truncate text-xs" title={seg.label}>
                {seg.shortLabel}
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs shrink-0">
                {seg.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chart 5: Customer Growth (Area Chart)
 */
export function CustomerGrowthChart({
  trendData,
}: {
  trendData: SalesTrendPoint[];
}) {
  if (!trendData || trendData.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-xs text-zinc-500 dark:text-white/40">
        No customer growth trend recorded.
      </div>
    );
  }

  const width = 800;
  const height = 220;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 35;

  let runningCount = 10;
  const points = trendData.map((d, i) => {
    runningCount += d.orders > 0 ? 1 : 0;
    const x = padLeft + (i / (trendData.length - 1 || 1)) * (width - padLeft - padRight);
    return { x, count: runningCount, label: d.label };
  });

  const maxCount = Math.max(...points.map((p) => p.count), 15);
  const chartHeight = height - padTop - padBottom;

  const areaPoints = points.map((p) => {
    const y = padTop + chartHeight - (p.count / maxCount) * chartHeight;
    return `${p.x},${y}`;
  });

  const lineStr = areaPoints.join(" ");
  const areaStr = `${points[0].x},${padTop + chartHeight} ${lineStr} ${points[points.length - 1].x},${padTop + chartHeight}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-white/60">
        <span>Cumulative Customer Base</span>
        <span className="font-mono text-[#18C729] font-bold">
          +{points[points.length - 1].count - points[0].count} in period
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          <defs>
            <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <polygon points={areaStr} fill="url(#custGrad)" />
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={lineStr}
          />

          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={padTop + chartHeight - (p.count / maxCount) * chartHeight}
              r={3}
              fill="#3b82f6"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
