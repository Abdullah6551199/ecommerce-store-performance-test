"use client";

import React, { useState, useEffect } from "react";
import type { AdminDashboardWidgetProps } from "@/types/apps";

/**
 * Example Admin Dashboard Widget
 * Injected into admin dashboard via "admin.dashboard.widget" extension point.
 */
export default function ExampleWidget({ className = "" }: AdminDashboardWidgetProps): React.JSX.Element {
  const [data, setData] = useState<{ count: number; status: string }>({
    count: 0,
    status: "healthy",
  });

  useEffect(() => {
    // TODO: Fetch app metrics or state from an admin API route
    setData({ count: 42, status: "active" });
  }, []);

  return (
    <div
      className={`rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/60 bg-white dark:bg-[#0c140f] p-5 shadow-sm space-y-2 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#25D366] dark:text-zinc-400">
          Template App Widget
        </h4>
        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
          {data.status}
        </span>
      </div>

      <p className="text-2xl font-black text-zinc-900 dark:text-white">
        {data.count}
      </p>

      <p className="text-[11px] text-zinc-500 dark:text-white/60">
        TODO: Customize this widget in apps/&lt;your-app&gt;/admin/ExampleWidget.tsx.
      </p>
    </div>
  );
}
