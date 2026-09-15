"use client";

import React from "react";

export default function HelloWorldWidget(): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-[#150a21] p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 1 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 1 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 1 0-4 0v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a2 2 0 1 1 0-4h1a1 1 0 0 0 1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1V4z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Hello from Apps! 🎉</h4>
          <p className="text-xs text-zinc-500 dark:text-white/60">
            Hello World demo app is active via admin.dashboard.widget extension point.
          </p>
        </div>
      </div>
    </div>
  );
}
