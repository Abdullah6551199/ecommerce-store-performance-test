"use client";

import React, { useState } from "react";
import type { TrackedOrder, OrderTrackingAppSettings, TimelineStepDef } from "../shared/types";

const DEFAULT_TIMELINE_STEPS: TimelineStepDef[] = [
  {
    key: "pending",
    title: "Order Placed",
    description: "Your order has been received and verified by our store system.",
  },
  {
    key: "confirmed",
    title: "Confirmed",
    description: "Order accepted and queued for fulfillment warehouse packing.",
  },
  {
    key: "processing",
    title: "Processing",
    description: "Your items are picked, packaged, and inspected for quality assurance.",
  },
  {
    key: "shipped",
    title: "Shipped",
    description: "Dispatched from warehouse and handed over to courier transit network.",
  },
  {
    key: "out_for_delivery",
    title: "Out for Delivery",
    description: "Courier rider has loaded your package and is delivering to your address.",
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "Package safely arrived at destination address. Enjoy your purchase!",
  },
];

export default function OrderTimeline({
  order,
  settings,
}: {
  order: TrackedOrder;
  settings?: Partial<OrderTrackingAppSettings>;
}): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const showCourier = settings?.showCourierField ?? true;
  const showTimeline = settings?.showTimeline ?? true;

  const normStatus = (order.status || "pending").toLowerCase();
  const isCancelled = normStatus === "cancelled";
  const isReturned = normStatus === "returned";

  const stepKeys = DEFAULT_TIMELINE_STEPS.map((s) => s.key);
  const currentStepIdx = stepKeys.indexOf(normStatus);

  const handleCopyTracking = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div
      data-app="order-tracking"
      className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 sm:p-8 shadow-sm space-y-8 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--theme-border,#E4E4E7)] pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-primary,#25D366)] block">
            Live Shipment Tracker
          </span>
          <h2 className="text-lg sm:text-xl font-black text-[var(--theme-text,#18181B)] tracking-tight mt-0.5 font-[family-name:var(--theme-font-heading)]">
            Order Status Progression
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isCancelled ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/10 text-red-600 border border-red-500/30">
              Cancelled
            </span>
          ) : isReturned ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 border border-orange-500/30">
              Returned
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text,#18181B)] border border-[var(--theme-border,#E4E4E7)] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--theme-primary,#25D366)] animate-pulse" />
              <span>{order.status.replace(/_/g, " ").toUpperCase()}</span>
            </span>
          )}
        </div>
      </div>

      {/* Tracking Metadata Box */}
      {showCourier && (order.courierName || order.trackingNumber || order.estimatedDelivery || order.statusNotes) && (
        <div className="rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {order.courierName && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] block">
                  Logistics Carrier
                </span>
                <p className="text-sm font-black text-[var(--theme-text,#18181B)] mt-0.5 flex items-center gap-1.5">
                  <span>🚚</span>
                  <span>{order.courierName}</span>
                </p>
              </div>
            )}

            {order.trackingNumber && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] block">
                  Waybill / Tracking Number
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs font-bold text-[var(--theme-text,#18181B)] bg-white px-2.5 py-1 rounded-lg border border-[var(--theme-border,#E4E4E7)]">
                    {order.trackingNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTracking(order.trackingNumber!)}
                    className="p-1 rounded-md text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] transition cursor-pointer"
                    title="Copy tracking code"
                  >
                    {copied ? (
                      <span className="text-[11px] font-bold text-[var(--theme-primary,#25D366)]">Copied!</span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {order.estimatedDelivery && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] block">
                  Estimated Delivery
                </span>
                <p className="text-sm font-black text-[var(--theme-text,#18181B)] mt-0.5 flex items-center gap-1.5">
                  <span>📅</span>
                  <span>{order.estimatedDelivery}</span>
                </p>
              </div>
            )}
          </div>

          {order.statusNotes && (
            <div className="pt-3 border-t border-[var(--theme-border,#E4E4E7)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] block">
                Public Dispatch Update
              </span>
              <p className="text-xs text-[var(--theme-text,#18181B)] mt-0.5 italic">
                &ldquo;{order.statusNotes}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Vertical Status Timeline */}
      {showTimeline && (
        <div className="relative pl-6 sm:pl-8 space-y-8">
          <div className="absolute left-[17px] sm:left-[21px] top-4 bottom-4 w-0.5 bg-[var(--theme-border,#E4E4E7)]" />

          {DEFAULT_TIMELINE_STEPS.map((step, idx) => {
            let state: "completed" | "current" | "pending" = "pending";

            if (!isCancelled && !isReturned) {
              if (currentStepIdx > idx) {
                state = "completed";
              } else if (currentStepIdx === idx) {
                state = "current";
              }
            }

            const isCompleted = state === "completed";
            const isCurrent = state === "current";

            let timeDisplay: string | null = null;
            if (step.key === "pending") {
              timeDisplay = new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            } else if (isCompleted || isCurrent) {
              const dateObj = order.updatedAt ? new Date(order.updatedAt) : new Date(order.createdAt);
              timeDisplay = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            } else {
              timeDisplay = "Pending";
            }

            return (
              <div key={step.key} className="relative flex items-start gap-4 sm:gap-6 group">
                <div
                  className={`absolute -left-[24px] sm:-left-[28px] flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs font-black transition-all ${
                    isCompleted
                      ? "bg-[var(--theme-primary,#25D366)] text-white shadow-sm"
                      : isCurrent
                      ? "bg-white text-[var(--theme-primary,#25D366)] border-2 border-[var(--theme-primary,#25D366)] ring-4 ring-[var(--theme-primary,#25D366)]/20 animate-pulse shadow-sm"
                      : "bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text-muted,#71717A)] border border-[var(--theme-border,#E4E4E7)]"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <span className="h-3 w-3 rounded-full bg-[var(--theme-primary,#25D366)]" />
                  ) : (
                    <span className="text-[11px] font-mono opacity-80">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm sm:text-base font-extrabold font-[family-name:var(--theme-font-heading)] ${
                          isCompleted || isCurrent
                            ? "text-[var(--theme-text,#18181B)]"
                            : "text-[var(--theme-text-muted,#71717A)]"
                        }`}
                      >
                        {step.title}
                      </h3>
                      {isCurrent && (
                        <span className="rounded-full bg-[var(--theme-primary,#25D366)] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
                          Current Status
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs font-mono ${
                        isCompleted || isCurrent
                          ? "text-[var(--theme-primary,#25D366)] font-semibold"
                          : "text-[var(--theme-text-muted,#71717A)]"
                      }`}
                    >
                      {timeDisplay}
                    </span>
                  </div>

                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isCompleted || isCurrent
                        ? "text-[var(--theme-text-muted,#71717A)]"
                        : "text-[var(--theme-text-muted,#71717A)]/70"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
