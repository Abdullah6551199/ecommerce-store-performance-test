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

  const formatDiscountValue = (c: CouponRecord) => {
    if (c.type === "free_shipping") return "Free Shipping";
    if (c.type === "fixed") return `$${c.value} off`;
    if (c.type === "percentage") return `${c.value}% off`;
    return `${c.value}% off`;
  };

  const formatCouponTypeLabel = (type: string) => {
    if (type === "percentage") return "Percentage";
    if (type === "fixed") return "Fixed";
    if (type === "free_shipping") return "Free Shipping";
    return type.replace(/_/g, " ");
  };

  // Full-size Card for Cart & Checkout pages (min-h-[80px], p-4, 2 clear rows)
  const renderFullCard = (c: CouponRecord) => {
    const status = formatCouponStatus(c);
    const remaining = c.minOrderValue ? c.minOrderValue - subtotal : 0;
    const discountText = formatDiscountValue(c);
    const typeLabel = formatCouponTypeLabel(c.type);

    return (
      <div
        key={c.id}
        className={`min-h-[80px] p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-3 ${
          status === "applied"
            ? "border-[#25D366] bg-[#F4F4F5]/70 dark:bg-[#18181B]/50 shadow-sm"
            : status === "available"
            ? "border-[#E4E4E7] dark:border-zinc-800/80 bg-white dark:bg-[#18181B]/20 hover:border-[#25D366] hover:bg-[#F4F4F5]/40 dark:hover:bg-[#18181B]/40 shadow-sm"
            : "border-zinc-200/80 dark:border-zinc-800/30 bg-zinc-50/60 dark:bg-[#18181B]/10 opacity-70"
        }`}
      >
        {/* Row 1: Code (bold, large) + Discount value badge + Apply/Status button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <span className="font-mono font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-200 tracking-wider">
              {c.code}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#1EA855] dark:text-zinc-400 text-xs font-bold shrink-0">
              {discountText}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400/60 capitalize shrink-0 font-medium">
              ({typeLabel})
            </span>
          </div>

          <div className="shrink-0">
            {status === "applied" ? (
              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#1EA855] dark:text-zinc-400 text-xs font-bold border border-[#E4E4E7] dark:border-zinc-700">
                Applied ✓
              </span>
            ) : status === "available" ? (
              <button
                type="button"
                onClick={() => handleApply(c.code)}
                disabled={isApplying}
                className="rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white px-4 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              >
                Apply
              </button>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
                {remaining > 0 ? `Add $${Math.ceil(remaining)} more` : "Locked"}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Description + Details: Min order • Expiry date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-zinc-600 dark:text-zinc-400/80 pt-2 border-t border-[#E4E4E7] dark:border-zinc-800/40">
          <span className="font-medium truncate">
            {c.description || `${discountText} on all eligible orders`}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400/60 shrink-0 font-mono">
            <span>{c.minOrderValue && c.minOrderValue > 0 ? `Min $${Math.round(c.minOrderValue)}` : "No min"}</span>
            <span>•</span>
            <span>Expires {formatExpiry(c.endDate)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Prominent "✨ Apply Best Coupon" Button with Purple Gradient
  const renderApplyBestButton = () => (
    <button
      type="button"
      onClick={handleApplyBest}
      disabled={isApplying}
      className="w-full min-h-[40px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] via-[#1EA855] to-[#25D366] hover:from-[#1EA855] hover:to-[#25D366] text-white font-extrabold text-xs shadow-md shadow-[#25D366]/20 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
    >
      <span className="text-sm">✨</span>
      <span>Apply Best Coupon</span>
    </button>
  );

  // Compact drawer version
  if (compact) {
    return (
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400/70 uppercase tracking-wider">
          <span>🎟️ Coupons</span>
        </div>

        {/* 1. Apply Best Coupon Button */}
        {renderApplyBestButton()}

        {/* 2. Applied Coupon Badge (if applied) */}
        {appliedCoupon && (
          <div className="flex items-center justify-between p-2 rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5]/70 dark:bg-[#18181B]/60 text-zinc-900 dark:text-zinc-200">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-[#25D366] text-white text-[9px] font-bold">
                ✓
              </span>
              <div className="min-w-0">
                <span className="font-mono font-bold text-xs">
                  {appliedCoupon.code} applied
                </span>
                <span className="text-[10px] text-[#25D366] dark:text-zinc-400 ml-1 font-semibold">
                  ({freeShippingCoupon ? "Free Shipping" : `-$${discountAmount.toFixed(2)}`})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-zinc-400 dark:text-zinc-400/50 hover:text-red-500 p-0.5 transition-colors"
              title="Remove coupon"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 3. Link to Full Cart for Manual Promo Codes & Available Coupons */}
        <div className="pt-0.5">
          <Link
            href="/cart"
            className="text-[10px] text-zinc-500 dark:text-zinc-400/70 hover:text-[#25D366] dark:hover:text-zinc-400 transition-colors flex items-center gap-1"
          >
            <span>💡</span>
            <span>For more options, visit cart →</span>
          </Link>
        </div>
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
        <div className="p-3 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5]/60 dark:bg-[#18181B]/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <p className="font-medium text-[#18181B] dark:text-zinc-300">
              {smartSuggestion}
            </p>
          </div>
          <Link
            href="/shop"
            className="shrink-0 rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-white dark:bg-[#18181B]/60 px-3 py-1 text-[11px] font-bold text-[#15803D] dark:text-zinc-300 hover:bg-[#F4F4F5] transition-colors"
          >
            Add Products
          </Link>
        </div>
      )}

      {/* 3. Applied Coupon or Manual Promo Input Card */}
      <div className="rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-[#F4F4F5]/30 dark:bg-[#18181B]/30 p-3.5 space-y-2.5">
        {appliedCoupon ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#1EA855] dark:text-zinc-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-zinc-900 dark:text-zinc-200">
                    {appliedCoupon.code}
                  </span>
                  <span className="rounded-md bg-[#DCFCE7] dark:bg-[#18181B]/60 px-2 py-0.5 text-[9px] font-bold text-[#1EA855] dark:text-zinc-400">
                    Applied
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400/70 mt-0.5">
                  {freeShippingCoupon
                    ? "Free standard delivery"
                    : `-$${discountAmount.toFixed(2)} discount applied`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeCoupon}
              className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-[#1EA855] dark:text-zinc-400 hover:text-red-500 hover:border-red-400 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
                className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181B]/60 px-3 py-2 text-xs font-mono font-bold uppercase text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-400 focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
              />
              <button
                type="button"
                onClick={() => handleApply()}
                disabled={isApplying || !inputCode.trim()}
                className="rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white px-4 py-2 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
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
        <div className="rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-[#F4F4F5]/20 dark:bg-[#18181B]/20 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Available Coupons</span>
              <span className="rounded-full bg-[#DCFCE7] dark:bg-[#18181B]/60 px-2 py-0.2 text-[10px] font-mono text-[#1EA855] dark:text-zinc-400">
                {availableCoupons.length}
              </span>
            </h3>

            <button
              type="button"
              onClick={() => setIsAvailableExpanded((prev) => !prev)}
              className="text-[11px] text-[#25D366] dark:text-zinc-400 hover:underline font-semibold cursor-pointer"
            >
              {isAvailableExpanded ? "Hide" : "Show"}
            </button>
          </div>

          {isAvailableExpanded && (
            <div className="grid grid-cols-1 gap-3 pt-0.5">
              {availableCoupons.map(renderFullCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
