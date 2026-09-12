"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import type { CouponRecord } from "@/lib/coupons";

interface CouponsSectionProps {
  compact?: boolean;
}

export default function CouponsSection({
  compact = false,
}: CouponsSectionProps): React.JSX.Element {
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAvailableExpanded, setIsAvailableExpanded] = useState(true);

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
    if (!dateStr) return "31 Dec";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Limited time";
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    } catch {
      return "Limited time";
    }
  };

  const formatCouponStatus = (c: CouponRecord) => {
    const isApplied = appliedCoupon?.code.toUpperCase() === c.code.toUpperCase();
    if (isApplied) return "applied";

    if (c.minOrderValue && subtotal < c.minOrderValue) {
      const remaining = c.minOrderValue - subtotal;
      if (remaining <= 50) return "almost";
      return "locked";
    }

    return "available";
  };

  // Compact card design (height <= 60px)
  const renderCompactCard = (c: CouponRecord) => {
    const status = formatCouponStatus(c);
    const remaining = c.minOrderValue ? c.minOrderValue - subtotal : 0;

    return (
      <div
        key={c.id}
        className={`p-2.5 rounded-xl border transition-all duration-150 ${
          status === "applied"
            ? "border-[#18C729] bg-[#18C729]/10 shadow-sm"
            : status === "available"
            ? "border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#18C729]/60 hover:bg-zinc-50 dark:hover:bg-white/[0.08]"
            : "border-zinc-200/80 dark:border-white/10 bg-zinc-50/60 dark:bg-white/[0.02] opacity-80"
        }`}
      >
        {/* Line 1: Code • Description + Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono font-black text-xs text-zinc-900 dark:text-white tracking-wide shrink-0">
              {c.code}
            </span>
            <span className="text-zinc-300 dark:text-white/30 text-xs shrink-0">•</span>
            <span
              className="text-xs text-zinc-600 dark:text-white/80 truncate font-medium"
              title={c.description || undefined}
            >
              {c.description ||
                (c.type === "fixed" ? `$${c.value} off` : `${c.value}% off`)}
            </span>
          </div>

          <div className="shrink-0">
            {status === "applied" ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#18C729]/20 text-[#18C729] text-[10px] font-bold">
                Applied ✓
              </span>
            ) : status === "available" ? (
              <button
                type="button"
                onClick={() => handleApply(c.code)}
                disabled={isApplying}
                className="rounded-lg bg-[#18C729] hover:bg-[#15af24] text-black px-2.5 py-1 text-[11px] font-bold hover:brightness-105 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              >
                Apply
              </button>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30">
                {remaining > 0 ? `Add $${Math.ceil(remaining)} more` : "Locked"}
              </span>
            )}
          </div>
        </div>

        {/* Line 2: Min $X • Expires Date */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-white/50 mt-1">
          <span>
            {c.minOrderValue && c.minOrderValue > 0
              ? `Min $${Math.round(c.minOrderValue)}`
              : "No min"}
          </span>
          <span className="text-zinc-300 dark:text-white/20">•</span>
          <span>Expires {formatExpiry(c.endDate)}</span>
        </div>
      </div>
    );
  };

  // Consistent Prominent "✨ Apply Best Coupon" Button
  const renderApplyBestButton = () => (
    <button
      type="button"
      onClick={handleApplyBest}
      disabled={isApplying}
      className="w-full min-h-[40px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
    >
      <span className="text-sm">✨</span>
      <span>Apply Best Coupon</span>
    </button>
  );

  // Compact drawer version
  if (compact) {
    return (
      <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-white/10 text-xs">
        {/* 1. Apply Best Coupon Button */}
        {renderApplyBestButton()}

        {/* 2. Applied Coupon Badge (if applied) */}
        {appliedCoupon && (
          <div className="flex items-center justify-between p-2 rounded-xl border border-[#18C729]/30 bg-[#18C729]/10 text-zinc-900 dark:text-white">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#18C729] text-black text-[10px] font-bold">
                ✓
              </span>
              <div className="min-w-0">
                <span className="font-mono font-bold text-xs block truncate">
                  {appliedCoupon.code}
                </span>
                <span className="text-[10px] text-[#18C729] block">
                  {freeShippingCoupon
                    ? "Free Shipping"
                    : `Saved $${discountAmount.toFixed(2)}`}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-zinc-400 dark:text-white/40 hover:text-red-500 p-1 transition-colors"
              title="Remove coupon"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 3. Manual Input */}
        <div className="space-y-1">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
              className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-1.5 text-xs font-mono uppercase text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none focus:border-[#18C729]"
            />
            <button
              type="button"
              onClick={() => handleApply()}
              disabled={isApplying || !inputCode.trim()}
              className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black px-3.5 py-1.5 text-xs font-bold hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
            >
              {isApplying ? "..." : "Apply"}
            </button>
          </div>

          {couponError && (
            <p className="text-[10px] text-red-500 font-medium">{couponError}</p>
          )}
        </div>

        {/* 4. Collapsible Available Coupons Accordion (Inline - does NOT hide products!) */}
        {availableCoupons.length > 0 && (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between text-[11px] text-[#18C729] hover:text-[#15af24] font-semibold py-1 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1">
                <span>🏷️</span>
                <span>Available Coupons ({availableCoupons.length})</span>
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-white/40">
                {isExpanded ? "▲ Hide" : "▼ View"}
              </span>
            </button>

            {isExpanded && (
              <div className="mt-1.5 space-y-1.5 max-h-40 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {availableCoupons.map(renderCompactCard)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full Version (Cart page & Checkout page)
  return (
    <div className="space-y-3.5">
      {/* 1. Apply Best Coupon Prominent Button */}
      {renderApplyBestButton()}

      {/* 2. Smart Suggestion Banner (if available) */}
      {smartSuggestion && (
        <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {smartSuggestion}
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-xl border border-amber-500/40 bg-white/50 dark:bg-black/30 px-3 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-white/80 dark:hover:bg-black/50 transition-colors"
          >
            Add Products
          </Link>
        </div>
      )}

      {/* 3. Applied Coupon or Manual Promo Input Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3.5 space-y-2.5">
        {appliedCoupon ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18C729]/20 text-[#18C729]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-zinc-900 dark:text-white">
                    {appliedCoupon.code}
                  </span>
                  <span className="rounded-md bg-[#18C729]/20 px-2 py-0.5 text-[9px] font-bold text-[#18C729]">
                    Applied
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-white/60 mt-0.5">
                  {freeShippingCoupon
                    ? "Free standard delivery"
                    : `-$${discountAmount.toFixed(2)} discount applied`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeCoupon}
              className="rounded-xl border border-zinc-200 dark:border-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:text-white/60 hover:text-red-500 hover:border-red-500/30 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
              Have a promo code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2 text-xs font-mono font-bold uppercase text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none focus:border-[#18C729]"
              />
              <button
                type="button"
                onClick={() => handleApply()}
                disabled={isApplying || !inputCode.trim()}
                className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 text-xs font-bold hover:brightness-110 transition-all disabled:opacity-40 cursor-pointer"
              >
                {isApplying ? "Applying..." : "Apply"}
              </button>
            </div>

            {couponError && (
              <p className="text-xs text-red-500 font-medium mt-1">{couponError}</p>
            )}
          </div>
        )}
      </div>

      {/* 4. Available Coupons List */}
      {availableCoupons.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Available Coupons</span>
              <span className="rounded-full bg-[#18C729]/20 px-2 py-0.2 text-[10px] font-mono text-[#18C729]">
                {availableCoupons.length}
              </span>
            </h3>

            <button
              type="button"
              onClick={() => setIsAvailableExpanded((prev) => !prev)}
              className="text-[11px] text-[#18C729] hover:underline font-semibold cursor-pointer"
            >
              {isAvailableExpanded ? "Hide" : "Show"}
            </button>
          </div>

          {isAvailableExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              {availableCoupons.map(renderCompactCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
