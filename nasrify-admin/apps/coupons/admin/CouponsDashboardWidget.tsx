"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithClientCache } from "@/lib/client-cache";
import type { CouponStats } from "../shared/types";

export default function CouponsDashboardWidget(): React.JSX.Element {
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadStats() {
      try {
        const json = await fetchWithClientCache<CouponStats>(
          "/api/admin/coupons/stats",
          { ttlMs: 20000 }
        );
        if (active && json.success && json.data) {
          setStats(json.data);
        }
      } catch {
        // Non-blocking
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStats();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-purple-200/80 dark:border-purple-900/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 shadow-xl shadow-purple-500/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#960DF2]/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#960DF2]/10 dark:bg-[#960DF2]/20 flex items-center justify-center text-[#960DF2]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Coupons &amp; Discounts
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Active campaigns &amp; redemption
            </p>
          </div>
        </div>

        <Link
          href="/admin/coupons"
          className="text-xs font-semibold text-[#960DF2] dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 transition-colors"
        >
          Manage &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3 pt-2">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-1/3" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-2/3" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-zinc-800/50 border border-purple-100/60 dark:border-purple-900/40">
            <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
              Active Codes
            </span>
            <span className="text-xl font-extrabold text-zinc-900 dark:text-white font-mono">
              {stats?.activeCoupons ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-zinc-800/50 border border-purple-100/60 dark:border-purple-900/40">
            <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
              Total Saved
            </span>
            <span className="text-xl font-extrabold text-[#960DF2] dark:text-[#EACFFC] font-mono">
              ${stats?.totalDiscountsGiven?.toFixed(0) ?? "0"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-zinc-800/50 border border-purple-100/60 dark:border-purple-900/40">
            <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
              Top Coupon
            </span>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono truncate block">
              {stats?.mostUsedCoupon?.code && stats.mostUsedCoupon.code !== "None"
                ? `${stats.mostUsedCoupon.code} (${stats.mostUsedCoupon.count})`
                : "None yet"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
