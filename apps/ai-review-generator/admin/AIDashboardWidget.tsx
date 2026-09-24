"use client";

import React, { useEffect, useState } from "react";
import type { AIStats } from "../shared/types";

export function AIDashboardWidget() {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/apps/ai-review-generator/history?limit=1")
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success && data.data?.stats) {
          setStats(data.data.stats);
        }
      })
      .catch((err) => console.error("Error fetching AI stats:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#25D366] to-indigo-600 flex items-center justify-center text-white shadow">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">AI Reviews</h4>
            <p className="text-[11px] text-slate-400">Workers AI Synthesis</p>
          </div>
        </div>
        <a
          href="/admin/ai-review-generator"
          className="text-xs text-zinc-400 hover:text-zinc-400 font-medium transition"
        >
          View Batches →
        </a>
      </div>

      {loading ? (
        <div className="py-4 text-center text-xs text-slate-500">Loading AI stats...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">All-Time Created</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{stats?.totalGenerated ?? 0}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">This Month</span>
            <span className="text-xl font-bold text-zinc-400 mt-0.5 block">{stats?.totalThisMonth ?? 0}</span>
          </div>
        </div>
      )}

      <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/70 pt-3">
        <span>Cloudflare Quota Status</span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Free Tier Active (10k/day)
        </span>
      </div>
    </div>
  );
}
