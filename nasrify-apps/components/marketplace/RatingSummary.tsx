"use client";

import React from "react";
import type { RatingSummary as RatingSummaryType } from "@/types/marketplace";

interface Props {
  summary: RatingSummaryType;
  onScrollToReviews?: () => void;
}

export function RatingSummary({ summary, onScrollToReviews }: Props) {
  const { averageRating, totalReviews, distribution, distributionPercentages } = summary;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
        {/* Left: Big Score & Stars */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-[180px]">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
              {totalReviews > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
            <span className="text-sm font-bold text-zinc-400">/ 5.0</span>
          </div>

          <div className="flex items-center gap-1 mt-2 text-amber-400 text-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {averageRating >= star ? "★" : averageRating >= star - 0.5 ? "★" : "☆"}
              </span>
            ))}
          </div>

          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-2">
            Based on{" "}
            {onScrollToReviews ? (
              <button
                type="button"
                onClick={onScrollToReviews}
                className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </button>
            ) : (
              <span className="font-bold text-zinc-900 dark:text-white">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </span>
            )}
          </p>
        </div>

        {/* Right: Star Bar Distribution */}
        <div className="w-full flex-1 max-w-md space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
            const pct = distributionPercentages[star as 1 | 2 | 3 | 4 | 5] || 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-7 font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-0.5 justify-end">
                  {star} <span className="text-amber-400 text-[11px]">★</span>
                </span>
                <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-medium text-zinc-400 tabular-nums">
                  {pct}% <span className="text-[10px] text-zinc-500">({count})</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
