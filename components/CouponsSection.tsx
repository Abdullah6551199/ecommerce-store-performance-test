"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import type { CouponRecord } from "@/lib/coupons";

interface CouponsSectionProps {
  compact?: boolean;
}

export default function CouponsSection({ compact = false }: CouponsSectionProps): React.JSX.Element {
  const {
    appliedCoupon,
    discountAmount,
    freeShippingCoupon,
    availableCoupons,
    bestCoupon,
    bestDiscount,
    smartSuggestion,
    couponError,
    subtotal,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [showAvailableModal, setShowAvailableModal] = useState(false);
  const [isAvailableExpanded, setIsAvailableExpanded] = useState(!compact);

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

  // Compact drawer version
  if (compact) {
    return (
      <div className="space-y-2.5 pt-2 border-t border-zinc-200 dark:border-white/10 text-xs">
        {/* Applied Coupon Badge */}
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#18C729]/30 bg-[#18C729]/10 text-zinc-900 dark:text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#18C729] text-black text-[10px] font-bold">
                ✓
              </span>
              <div>
                <span className="font-mono font-bold text-xs">{appliedCoupon.code}</span>
                <span className="text-[10px] text-[#18C729] block">
                  {freeShippingCoupon ? "Free Shipping" : `Saved $${discountAmount.toFixed(2)}`}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-zinc-400 dark:text-white/40 hover:text-red-400 p-1 transition-colors"
              title="Remove coupon"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          /* Manual Input */
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Discount code"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-1.5 text-xs font-mono uppercase text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none focus:border-[#18C729]"
              />
              <button
                type="button"
                onClick={() => handleApply()}
                disabled={isApplying || !inputCode.trim()}
                className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black px-3 py-1.5 text-xs font-bold hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
              >
                {isApplying ? "..." : "Apply"}
              </button>
            </div>

            {couponError && (
              <p className="text-[10px] text-red-500">{couponError}</p>
            )}

            {/* View Available Link */}
            {availableCoupons.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAvailableModal(true)}
                className="text-[11px] text-[#18C729] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>🏷️ View available coupons ({availableCoupons.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Modal for available coupons inside Drawer */}
        {showAvailableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0c140f] p-5 shadow-2xl text-zinc-900 dark:text-white max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3 mb-3">
                <h3 className="text-sm font-bold">Available Coupons</h3>
                <button
                  type="button"
                  onClick={() => setShowAvailableModal(false)}
                  className="rounded-xl p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
                {availableCoupons.map((c) => {
                  const status = formatCouponStatus(c);
                  const isLocked = status === "locked" || status === "almost";
                  const remaining = c.minOrderValue ? c.minOrderValue - subtotal : 0;

                  return (
                    <div
                      key={c.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        status === "applied"
                          ? "border-[#18C729] bg-[#18C729]/10"
                          : status === "available"
                          ? "border-[#18C729]/40 bg-zinc-50 dark:bg-white/5"
                          : status === "almost"
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] opacity-75"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs">{c.code}</span>
                        {status === "applied" ? (
                          <span className="text-[10px] font-bold text-[#18C729]">Applied</span>
                        ) : status === "available" ? (
                          <button
                            type="button"
                            onClick={() => {
                              handleApply(c.code);
                              setShowAvailableModal(false);
                            }}
                            className="rounded-lg bg-[#18C729] text-black px-2.5 py-1 text-[10px] font-bold hover:brightness-110"
                          >
                            Apply
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-zinc-400 dark:text-white/40">
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-white/70 mt-1">{c.description}</p>
                      {isLocked && remaining > 0 && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                          Add ${remaining.toFixed(2)} more to unlock
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Version (Cart page & Checkout page)
  return (
    <div className="space-y-4">
      {/* Method 3: Auto-Apply Best Coupon Banner */}
      {bestCoupon && (!appliedCoupon || appliedCoupon.code !== bestCoupon.code) && bestDiscount > 0 && (
        <div className="p-3.5 rounded-2xl border border-[#18C729]/40 bg-gradient-to-r from-[#18C729]/15 to-[#FEF500]/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-base">✨</span>
            <div>
              <p className="font-bold text-zinc-900 dark:text-white">
                Best coupon available: <span className="font-mono text-[#18C729]">{bestCoupon.code}</span>
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-white/70">
                Save ${bestDiscount.toFixed(2)} on this order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleApply(bestCoupon.code)}
            disabled={isApplying}
            className="rounded-xl bg-[#18C729] px-3.5 py-1.5 text-xs font-bold text-black hover:brightness-110 shadow-sm transition-all cursor-pointer"
          >
            Apply Best
          </button>
        </div>
      )}

      {/* Method 4: Smart Suggestion Banner */}
      {smartSuggestion && (
        <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
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

      {/* Method 1: Applied Coupon Display or Manual Code Input */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 space-y-3">
        {appliedCoupon ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#18C729]/20 text-[#18C729]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-zinc-900 dark:text-white">
                    {appliedCoupon.code}
                  </span>
                  <span className="rounded-md bg-[#18C729]/20 px-2 py-0.5 text-[10px] font-bold text-[#18C729]">
                    Applied
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-white/60 mt-0.5">
                  {freeShippingCoupon
                    ? "Free standard delivery"
                    : `-$${discountAmount.toFixed(2)} discount applied`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeCoupon}
              className="rounded-xl border border-zinc-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-white/60 hover:text-red-500 hover:border-red-500/30 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1.5">
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
                className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/30 px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none focus:border-[#18C729]"
              />
              <button
                type="button"
                onClick={() => handleApply()}
                disabled={isApplying || !inputCode.trim()}
                className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:brightness-110 transition-all disabled:opacity-40 cursor-pointer"
              >
                {isApplying ? "Applying..." : "Apply"}
              </button>
            </div>

            {couponError && (
              <p className="text-xs text-red-500 font-medium mt-1.5">{couponError}</p>
            )}
          </div>
        )}
      </div>

      {/* Method 2: Available Coupons List */}
      {availableCoupons.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] p-4 space-y-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {availableCoupons.map((c) => {
                const status = formatCouponStatus(c);
                const isLocked = status === "locked" || status === "almost";
                const remaining = c.minOrderValue ? c.minOrderValue - subtotal : 0;

                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                      status === "applied"
                        ? "border-[#18C729] bg-[#18C729]/10 shadow-sm"
                        : status === "available"
                        ? "border-[#18C729]/40 bg-white dark:bg-[#0c140f] hover:border-[#18C729]"
                        : status === "almost"
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-zinc-200 dark:border-white/10 bg-zinc-100/50 dark:bg-white/[0.02] opacity-75"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-xs text-zinc-900 dark:text-white">
                          {c.code}
                        </span>
                        {c.isFeatured && (
                          <span className="rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 text-[9px] font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-white/70 mt-1 leading-snug">
                        {c.description || `${c.value}% off`}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/60 dark:border-white/5 flex items-center justify-between">
                      <div>
                        {c.minOrderValue && c.minOrderValue > 0 ? (
                          <span className="text-[10px] text-zinc-500 dark:text-white/40 block">
                            Min order: ${c.minOrderValue.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 dark:text-white/40 block">
                            No minimum
                          </span>
                        )}
                        {isLocked && remaining > 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                            Add ${remaining.toFixed(2)} more to unlock
                          </span>
                        )}
                      </div>

                      {status === "applied" ? (
                        <span className="rounded-lg bg-[#18C729]/20 px-2 py-1 text-[10px] font-bold text-[#18C729]">
                          Applied ✓
                        </span>
                      ) : status === "available" ? (
                        <button
                          type="button"
                          onClick={() => handleApply(c.code)}
                          disabled={isApplying}
                          className="rounded-lg bg-[#18C729] text-black px-3 py-1 text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
                        >
                          Apply
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-zinc-400 dark:text-white/40">
                          Locked
                        </span>
                      )}
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
