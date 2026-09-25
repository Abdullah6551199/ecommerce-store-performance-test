"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import type { CouponRecord } from "../shared/types";
import { DEFAULT_COUPONS_SETTINGS, type CouponsAppSettings } from "../shared/types";

interface CouponInputProps {
  compact?: boolean;
}

export default function CouponInput({
  compact = false,
}: CouponInputProps): React.JSX.Element | null {
  const {
    appliedCoupon,
    discountAmount,
    freeShippingCoupon,
    availableCoupons,
    smartSuggestion,
    couponError,
    subtotal,
    applyCoupon,
    applyBestCoupon,
    removeCoupon,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isAvailableExpanded, setIsAvailableExpanded] = useState(true);
  const [settings, setSettings] = useState<CouponsAppSettings>(DEFAULT_COUPONS_SETTINGS);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSettings() {
      try {
        const res = await fetch("/api/apps/coupons/settings");
        if (res.ok) {
          const json = (await res.json()) as any;
          if (active) {
            if (json.data === null || json.data?.enabled === false) {
              setIsEnabled(false);
            } else if (json.success && json.data) {
              setIsEnabled(true);
              setSettings({ ...DEFAULT_COUPONS_SETTINGS, ...json.data });
            }
          }
        }
      } catch {
        // Fallback to default enabled
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  if (isLoaded && !isEnabled) {
    return null;
  }

  const handleApply = async (codeToApply?: string) => {
    const code = codeToApply || inputCode;
    if (!code.trim()) return;

    setIsApplying(true);
    const res = await applyCoupon(code);
    setIsApplying(false);
    if (res.success) {
      setInputCode("");
    }
  };

  const handleApplyBest = async () => {
    setIsApplying(true);
    await applyBestCoupon();
    setIsApplying(false);
  };

  const formatExpiry = (dateStr?: string | null) => {
    if (!dateStr) return "Limited time";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Limited time";
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    } catch {
      return "Limited time";
    }
  };

  // 1. RENDER APPLIED COUPON STATE
  if (appliedCoupon) {
    return (
      <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-[#25D366] dark:bg-emerald-400/10 dark:text-[#25D366]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs sm:text-sm font-extrabold tracking-wider text-emerald-900 dark:text-emerald-100">
                  {appliedCoupon.code}
                </span>
                <span className="rounded-full bg-emerald-600/15 dark:bg-emerald-400/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Applied
                </span>
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 truncate mt-0.5">
                {freeShippingCoupon
                  ? "Free Shipping unlocked"
                  : `Saving $${discountAmount.toFixed(2)} on this order`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={removeCoupon}
            className="shrink-0 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  // 2. RENDER COMPACT INPUT (CART DRAWER)
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="Promo Code"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/80 px-3 py-2 text-xs font-mono uppercase text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366]"
            />
          </div>
          <button
            type="button"
            disabled={isApplying || !inputCode.trim()}
            onClick={() => handleApply()}
            className="rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1EA855] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
          >
            {isApplying ? "..." : "Apply"}
          </button>
        </div>

        {couponError && (
          <p className="text-[11px] text-red-500 font-medium px-1 animate-fadeIn">
            {couponError}
          </p>
        )}

        {smartSuggestion && (
          <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
            <span>✨ {smartSuggestion}</span>
          </div>
        )}
      </div>
    );
  }

  // 3. RENDER FULL CARD INPUT (CART & CHECKOUT PAGES)
  return (
    <div className="space-y-4">
      {/* Code Input Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Enter coupon or promo code"
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 px-4 py-3 text-xs sm:text-sm font-mono uppercase text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-[#25D366] focus:outline-none focus:ring-2 focus:ring-[#25D366]/20"
          />
        </div>
        <button
          type="button"
          disabled={isApplying || !inputCode.trim()}
          onClick={() => handleApply()}
          className="rounded-2xl bg-[#25D366] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-[#1EA855] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
        >
          {isApplying ? "Checking..." : "Apply Coupon"}
        </button>
      </div>

      {couponError && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 p-3 text-xs text-red-600 dark:text-red-400 font-medium">
          {couponError}
        </div>
      )}

      {smartSuggestion && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <span className="font-medium">{smartSuggestion}</span>
          </div>
        </div>
      )}

      {/* Available Coupons Accordion */}
      {availableCoupons && availableCoupons.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setIsAvailableExpanded(!isAvailableExpanded)}
              className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 hover:text-[#25D366] transition-colors"
            >
              <span>Available Coupons ({availableCoupons.length})</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${isAvailableExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleApplyBest}
              disabled={isApplying}
              className="text-xs font-semibold text-[#25D366] hover:text-[#1EA855] flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              Apply Best &rarr;
            </button>
          </div>

          {isAvailableExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {availableCoupons.map((c) => {
                const isEligible = !c.minOrderValue || subtotal >= c.minOrderValue;
                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                      isEligible
                        ? "border-emerald-200/90 dark:border-emerald-800/60 bg-white/70 dark:bg-zinc-900/60 shadow-sm"
                        : "border-zinc-200/60 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-70"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-black text-[#25D366] tracking-wide">
                          {c.code}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          Expires: {formatExpiry(c.endDate)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {c.description || `${c.value}% discount`}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 mt-2">
                      <span className="text-[10px] font-medium text-zinc-500">
                        {c.minOrderValue ? `Min: $${c.minOrderValue.toFixed(0)}` : "No min order"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApply(c.code)}
                        disabled={isApplying}
                        className="text-[11px] font-bold text-[#25D366] hover:text-[#1EA855] transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
