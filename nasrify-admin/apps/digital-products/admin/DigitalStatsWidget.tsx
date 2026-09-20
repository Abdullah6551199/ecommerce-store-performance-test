"use client";

import React, { useState, useEffect } from "react";

export function DigitalStatsWidget(): React.JSX.Element {
  const [stats, setStats] = useState<{
    totalProducts: number;
    downloadsThisMonth: number;
    topProduct: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/apps/digital-products/stats");
        const data: any = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch {
        // Non-blocking widget
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💾</span>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            Digital Delivery KPIs
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          Live Stats
        </span>
      </div>

      {loading ? (
        <div className="text-xs text-zinc-400 py-4 text-center">
          Loading metrics...
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-semibold block uppercase">
              Digital SKUs
            </span>
            <span className="text-lg font-black text-zinc-900 dark:text-white mt-0.5 block">
              {stats?.totalProducts ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-semibold block uppercase">
              Downloads (Mo)
            </span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5 block">
              {stats?.downloadsThisMonth ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-semibold block uppercase">
              Top Download
            </span>
            <span className="text-xs font-bold text-zinc-900 dark:text-white mt-1 block truncate">
              {stats?.topProduct || "None yet"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DigitalStatsWidget;
