"use client";

import React, { useEffect, useState } from "react";
import LucideIcon from "@/components/icons/LucideIcon";
import type { TrustBadgeItem, TrustBadgesAppSettings, TrustBadgeLocation } from "../shared/types";
import { DEFAULT_TRUST_BADGES_SETTINGS } from "../shared/types";
import PaymentIconsRow from "./PaymentIconsRow";

interface TrustBadgesRowProps {
  location?: TrustBadgeLocation | string;
  limit?: number;
  className?: string;
  variant?: "card" | "row" | "compact" | "footer";
  initialBadges?: TrustBadgeItem[];
  settings?: Partial<TrustBadgesAppSettings>;
}

export default function TrustBadgesRow({
  location = "all",
  limit = 4,
  className = "",
  variant = "card",
  initialBadges,
  settings: propSettings,
}: TrustBadgesRowProps): React.JSX.Element | null {
  const [badges, setBadges] = useState<TrustBadgeItem[]>(initialBadges || []);
  const [settings, setSettings] = useState<TrustBadgesAppSettings>({
    ...DEFAULT_TRUST_BADGES_SETTINGS,
    ...propSettings,
  });
  const [loading, setLoading] = useState(!initialBadges || initialBadges.length === 0);

  useEffect(() => {
    // Fetch live app settings if not provided via props
    if (!propSettings) {
      fetch("/api/apps/trust-badges/settings")
        .then((res) => res.json() as Promise<any>)
        .then((json) => {
          if (json.success && json.data) {
            setSettings((prev) => ({ ...prev, ...json.data }));
          }
        })
        .catch(() => {});
    }

    if (!initialBadges || initialBadges.length === 0) {
      const url = location ? `/api/trust-badges?location=${encodeURIComponent(location)}` : "/api/trust-badges";
      fetch(url)
        .then((res) => res.json() as Promise<any>)
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setBadges(json.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [location, initialBadges, propSettings]);

  // Check if badges are enabled for this location based on app settings
  if (location === "product" && settings.showOnProductPage === false) return null;
  if (location === "cart" && settings.showOnCartPage === false) return null;
  if (location === "checkout" && settings.showOnCheckoutPage === false) return null;

  const displayBadges = limit ? badges.slice(0, limit) : badges;

  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse ${className}`}>
        {Array.from({ length: limit || 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (displayBadges.length === 0) {
    return null;
  }

  // Alignment classes
  const alignmentClass =
    settings.badgeAlignment === "left"
      ? "justify-start text-left"
      : settings.badgeAlignment === "right"
      ? "justify-end text-right"
      : "justify-center text-center";

  // Size classes
  const sizeIconBox =
    settings.badgeSize === "sm"
      ? "h-6 w-6"
      : settings.badgeSize === "lg"
      ? "h-10 w-10"
      : "h-8 w-8 sm:h-9 sm:w-9";

  const sizeIcon =
    settings.badgeSize === "sm"
      ? "h-3.5 w-3.5"
      : settings.badgeSize === "lg"
      ? "h-5 w-5"
      : "h-4 w-4 sm:h-4.5 sm:w-4.5";

  const sizeTitle =
    settings.badgeSize === "sm"
      ? "text-[10px]"
      : settings.badgeSize === "lg"
      ? "text-xs font-black"
      : "text-[11px] sm:text-xs font-bold";

  const sizeDesc =
    settings.badgeSize === "sm"
      ? "text-[8px]"
      : settings.badgeSize === "lg"
      ? "text-[11px]"
      : "text-[9px] sm:text-[10px]";

  // Compact variant (checkout & sidebars)
  if (variant === "compact") {
    return (
      <div className={`space-y-3 ${className}`} data-app="trust-badges">
        <div className="grid grid-cols-2 gap-2.5">
          {displayBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 transition-all hover:border-[#25D366]/40"
            >
              <div
                className={`flex ${sizeIconBox} shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366]`}
              >
                <LucideIcon name={badge.icon} className={sizeIcon} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`${sizeTitle} text-zinc-900 dark:text-white truncate`}>
                  {badge.title}
                </h4>
                {badge.description && (
                  <p className={`${sizeDesc} text-zinc-500 dark:text-zinc-400 truncate`}>
                    {badge.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        {settings.showPaymentIcons && (location === "checkout" || location === "cart") && (
          <PaymentIconsRow className="pt-1" />
        )}
      </div>
    );
  }

  // Standard Card row
  return (
    <div className={`space-y-3 ${className}`} data-app="trust-badges">
      <div
        className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 ${alignmentClass}`}
        data-testid="trust-badges-container"
      >
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            className="group relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 sm:p-3 shadow-xs transition-all hover:border-[#25D366]/40 hover:bg-emerald-50/20 dark:hover:bg-zinc-800/40"
          >
            <div
              className={`flex ${sizeIconBox} shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] shadow-xs group-hover:scale-105 transition-transform`}
            >
              <LucideIcon name={badge.icon} className={sizeIcon} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className={`${sizeTitle} text-zinc-900 dark:text-white truncate`}>
                {badge.title}
              </h4>
              {badge.description && (
                <p className={`${sizeDesc} text-zinc-500 dark:text-zinc-400 truncate`}>
                  {badge.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {settings.showPaymentIcons && (location === "checkout" || location === "cart") && (
        <PaymentIconsRow className="pt-2" />
      )}
    </div>
  );
}
