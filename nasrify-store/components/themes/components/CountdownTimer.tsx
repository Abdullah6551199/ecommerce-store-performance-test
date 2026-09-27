"use client";

import React, { useEffect, useState } from "react";
import { EditableComponent } from "../EditableComponent";

export interface CountdownTimerProps {
  id?: string;
  sectionId?: string;
  settings?: {
    target_date?: string;
    headline?: string;
    expired_text?: string;
  };
}

export function CountdownTimer({
  id = "countdown_timer",
  sectionId,
  settings = {},
}: CountdownTimerProps) {
  const targetDateStr = settings.target_date || "2026-12-31";
  const headline = settings.headline || "Flash Sale Ends In:";
  const expiredText = settings.expired_text || "Sale Ended";

  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDateStr).getTime();
    if (isNaN(target)) return;

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  if (expired) {
    return (
      <EditableComponent id={id} type="countdown_timer" sectionId={sectionId} className="p-3 text-center text-xs font-semibold text-rose-500">
        {expiredText}
      </EditableComponent>
    );
  }

  return (
    <EditableComponent
      id={id}
      type="countdown_timer"
      sectionId={sectionId}
      className="p-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] my-3"
    >
      {headline && (
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] mb-2.5 text-center">
          {headline}
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 text-center max-w-xs mx-auto">
        {[
          { label: "Days", val: timeLeft.d },
          { label: "Hours", val: timeLeft.h },
          { label: "Mins", val: timeLeft.m },
          { label: "Secs", val: timeLeft.s },
        ].map((item, idx) => (
          <div key={idx} className="bg-[var(--theme-background,#FFFFFF)] rounded-lg p-2 border border-[var(--theme-border,#E4E4E7)] shadow-2xs">
            <span className="block font-mono font-extrabold text-base sm:text-lg text-[var(--theme-text,#18181B)]">
              {String(item.val).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-[var(--theme-text-muted,#71717A)] font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </EditableComponent>
  );
}

export default CountdownTimer;
