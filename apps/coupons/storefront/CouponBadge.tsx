"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_COUPONS_SETTINGS, type CouponsAppSettings } from "../shared/types";

interface CouponBadgeProps {
  productId?: string;
  className?: string;
}

export default function CouponBadge({
  productId: _productId,
  className = "",
}: CouponBadgeProps): React.JSX.Element | null {
  const [settings, setSettings] = useState<CouponsAppSettings>(DEFAULT_COUPONS_SETTINGS);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSettings() {
      try {
        const res = await fetch("/api/apps/coupons/settings");
        if (res.ok) {
          const json = (await res.json()) as any;
          if (active) {
            if (json.data && json.data.enabled !== false && json.data.showBadgeOnProducts === true) {
              setIsEnabled(true);
              setSettings({ ...DEFAULT_COUPONS_SETTINGS, ...json.data });
            } else {
              setIsEnabled(false);
            }
          }
        }
      } catch {
        // Fallback
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  if (!isLoaded || !isEnabled) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[#960DF2]/10 dark:bg-[#960DF2]/20 px-2 py-0.5 text-[10px] font-bold text-[#960DF2] dark:text-[#EACFFC] border border-[#960DF2]/20 ${className}`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <span>{settings.badgeText || "Coupon Available"}</span>
    </span>
  );
}
