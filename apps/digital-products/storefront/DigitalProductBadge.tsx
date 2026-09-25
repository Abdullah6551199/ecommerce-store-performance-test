"use client";

import React, { useState, useEffect } from "react";

interface DigitalProductBadgeProps {
  productId: string;
}

export function DigitalProductBadge({ productId }: DigitalProductBadgeProps): React.JSX.Element | null {
  const [isDigital, setIsDigital] = useState<boolean | null>(null);

  useEffect(() => {
    if (!productId) return;
    async function checkDigital() {
      try {
        const res = await fetch(`/api/apps/digital-products/check?productId=${encodeURIComponent(productId)}`);
        const data: any = await res.json();
        setIsDigital(!!data.isDigital);
      } catch {
        setIsDigital(false);
      }
    }
    checkDigital();
  }, [productId]);

  if (!isDigital) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/80 to-zinc-50/50 dark:from-zinc-900/40 dark:to-zinc-900 p-4 my-4 flex items-center gap-3.5 shadow-sm">
      <div className="h-10 w-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center text-lg shrink-0 shadow-md shadow-emerald-500/20">
        ⚡
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Instant Digital Delivery
          </span>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Downloadable
          </span>
        </div>
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
          Download links and access keys are generated immediately after checkout and accessible in your account vault.
        </p>
      </div>
    </div>
  );
}

export default DigitalProductBadge;
