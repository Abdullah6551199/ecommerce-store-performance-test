"use client";

import React, { useEffect, useState } from "react";
import LucideIcon from "@/components/icons/LucideIcon";
import type { TrustBadgeRecord } from "@/lib/db";

interface TrustBadgesProps {
  location?: "all" | "product" | "cart" | "checkout" | "footer" | string;
  limit?: number;
  className?: string;
  variant?: "card" | "row" | "compact" | "footer";
  initialBadges?: TrustBadgeRecord[];
}

export default function TrustBadges({
  location = "all",
  limit = 4,
  className = "",
  variant = "card",
  initialBadges,
}: TrustBadgesProps): React.JSX.Element {
  const [badges, setBadges] = useState<TrustBadgeRecord[]>(initialBadges || []);
  const [loading, setLoading] = useState(!initialBadges || initialBadges.length === 0);

  useEffect(() => {
    if (!initialBadges || initialBadges.length === 0) {
      const url = location ? `/api/trust-badges?location=${encodeURIComponent(location)}` : "/api/trust-badges";
      fetch(url)
        .then((res) => res.json() as Promise<any>)
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setBadges(json.data);
          }
        })
        .catch((err) => console.warn("Failed to load trust badges:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [location, initialBadges]);

  const displayBadges = limit ? badges.slice(0, limit) : badges;

  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse ${className}`}>
        {Array.from({ length: limit || 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-[#F4F4F5]/60 dark:bg-[#18181B]/40 border border-[#E4E4E7] dark:border-zinc-800/40"
          />
        ))}
      </div>
    );
  }

  if (displayBadges.length === 0) {
    return <></>;
  }

  // Compact variant (e.g. for small sidebar or checkout)
  if (variant === "compact") {
    return (
      <div className={`grid grid-cols-2 gap-2.5 ${className}`}>
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            className="flex items-center gap-2 rounded-xl border border-[#E4E4E7] dark:border-zinc-800/60 bg-[#F4F4F5]/40 dark:bg-[#18181B]/30 p-2.5 transition-all hover:border-[#E4E4E7] dark:hover:border-zinc-700"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10 dark:bg-[#25D366]/20 text-[#25D366] dark:text-[#DCFCE7]">
              <LucideIcon name={badge.icon} className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] font-bold text-[#18181B] dark:text-white truncate">
                {badge.title}
              </h4>
              {badge.description && (
                <p className="text-[9px] text-[#15803D]/70 dark:text-[#DCFCE7]/70 truncate">
                  {badge.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Standard Card row (Product & Cart pages)
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 ${className}`}
      data-testid="trust-badges-container"
    >
      {displayBadges.map((badge) => (
        <div
          key={badge.id}
          className="group relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-2.5 rounded-xl border border-[#E4E4E7]/80 dark:border-zinc-800/60 bg-[#F4F4F5]/50 dark:bg-[#18181B]/20 p-2.5 sm:p-3 shadow-xs transition-all hover:border-[#25D366]/40 hover:bg-[#F4F4F5]/80 dark:hover:bg-[#18181B]/40"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#25D366] dark:text-[#DCFCE7] shadow-xs group-hover:scale-105 transition-transform">
            <LucideIcon name={badge.icon} className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#18181B] dark:text-white tracking-tight leading-tight">
              {badge.title}
            </h4>
            {badge.description && (
              <p className="mt-0.5 text-[10px] text-[#15803D]/80 dark:text-[#DCFCE7]/70 leading-snug">
                {badge.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
