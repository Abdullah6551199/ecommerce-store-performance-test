"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchWithClientCache } from "@/lib/client-cache";

interface WhatsAppStats {
  totalOrdersThisMonth: number;
  totalRevenueThisMonth: number;
  lastOrderTime: string | null;
}

/**
 * Admin Dashboard KPI Widget for WhatsApp Order App.
 * Displays: Total WhatsApp orders this month, WhatsApp revenue, last order time.
 * Uses 20-second client-side micro-cache.
 */
export default function WhatsAppStatsWidget(): React.JSX.Element {
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (force = false) => {
    try {
      const json = await fetchWithClientCache<any>("/api/admin/whatsapp-order/stats", {
        ttlMs: 20000,
        forceRefresh: force,
      });
      if (json && json.success && json.stats) {
        setStats(json.stats);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatTime = (ts: string | null) => {
    if (!ts) return "No orders yet";
    try {
      const date = new Date(ts);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div
      data-widget="whatsapp-order-stats"
      className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#07190f] p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.301-.15-1.781-.879-2.056-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.953 1.181-.176.201-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.799-1.498-1.786-1.674-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.1-.201.05-.376-.025-.527s-.677-1.632-.928-2.234c-.244-.587-.492-.507-.677-.516l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9-.12.58-.352 1.781-1.28 2.032-1.882.251-.602.251-1.118.176-1.229-.075-.11-.276-.176-.577-.326zM12.04 2C6.52 2 2.04 6.48 2.04 12c0 1.98.58 3.82 1.58 5.38L2 22l4.77-1.58C8.28 21.36 10.1 22 12.04 22c5.52 0 10-4.48 10-10S17.56 2 12.04 2zm0 18.2c-1.68 0-3.24-.52-4.54-1.41l-.33-.22-2.82.93.94-2.75-.24-.37c-.98-1.5-1.51-3.25-1.51-5.08 0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5c0 4.69-3.81 8.5-8.5 8.5z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">WhatsApp Orders</h4>
            <p className="text-[11px] text-zinc-500 dark:text-white/60">Live chat-to-order performance</p>
          </div>
        </div>

        <Link
          href="/admin/orders?source=whatsapp"
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          <span>View Orders</span>
          <span>&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-950/60">
        <div>
          <p className="text-[10px] uppercase font-mono text-zinc-400 dark:text-white/40">Orders (Month)</p>
          <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-0.5">
            {loading ? "..." : stats?.totalOrdersThisMonth ?? 0}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-mono text-zinc-400 dark:text-white/40">Revenue (Month)</p>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {loading ? "..." : `$${(stats?.totalRevenueThisMonth ?? 0).toFixed(2)}`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-mono text-zinc-400 dark:text-white/40">Last Order</p>
          <p className="text-xs font-semibold text-zinc-700 dark:text-white/80 mt-1 truncate" title={stats?.lastOrderTime || ""}>
            {loading ? "..." : formatTime(stats?.lastOrderTime ?? null)}
          </p>
        </div>
      </div>
    </div>
  );
}
