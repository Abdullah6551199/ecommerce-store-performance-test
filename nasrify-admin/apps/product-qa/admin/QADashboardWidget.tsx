"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { QAStats } from "../shared/types";

export default function QADashboardWidget(): React.JSX.Element {
  const [stats, setStats] = useState<QAStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/apps/product-qa/stats");
        const json = (await res.json().catch(() => ({}))) as Record<string, any>;
        if (json.success && json.data) {
          setStats(json.data);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#120524] p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Product Q&amp;A</h3>
            <p className="text-[11px] text-zinc-400">Community &amp; Shopper Inquiries</p>
          </div>
        </div>

        <Link
          href="/admin/product-qa"
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
        >
          View all &rarr;
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-center">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Pending
          </span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
            {loading ? "..." : stats?.pendingQuestions ?? 0}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-center">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Published
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {loading ? "..." : stats?.publishedQuestions ?? 0}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-center">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Answers
          </span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5 block">
            {loading ? "..." : stats?.totalAnswers ?? 0}
          </span>
        </div>
      </div>

      {/* Top 5 Most Upvoted Questions */}
      <div>
        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
          Top Upvoted Questions
        </h4>

        {loading ? (
          <div className="py-4 text-center text-xs text-zinc-400">Loading top questions...</div>
        ) : !stats?.topUpvotedQuestions || stats.topUpvotedQuestions.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic py-2">
            No community questions yet.
          </p>
        ) : (
          <div className="space-y-2">
            {stats.topUpvotedQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-2 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5 text-xs gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {q.question}
                  </p>
                  {q.productName && (
                    <p className="text-[10px] text-zinc-400 truncate">{q.productName}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                  <span>👍 {q.upvoteCount}</span>
                  <span className="text-zinc-300 dark:text-zinc-600">•</span>
                  <span className="text-zinc-500">💬 {q.answerCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
