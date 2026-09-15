import React from "react";

export default function AdminLoadingSkeleton({
  title = "Loading Module...",
}: {
  title?: string;
}): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="flex items-center justify-between">
        <div className="h-9 w-64 rounded-xl bg-purple-200/60 dark:bg-purple-900/40" />
        <div className="h-9 w-32 rounded-xl bg-purple-200/40 dark:bg-purple-900/30" />
      </div>
      <div className="rounded-2xl border border-purple-200/60 dark:border-purple-900/40 bg-white dark:bg-[#200435] p-6 space-y-4 shadow-sm">
        <div className="h-6 w-48 rounded-lg bg-purple-200/50 dark:bg-purple-900/30" />
        <div className="h-20 w-full rounded-xl bg-purple-100/50 dark:bg-purple-900/20" />
        <div className="space-y-2 pt-4">
          <div className="h-10 w-full rounded-lg bg-purple-100/40 dark:bg-purple-900/20" />
          <div className="h-10 w-full rounded-lg bg-purple-100/30 dark:bg-purple-900/10" />
          <div className="h-10 w-full rounded-lg bg-purple-100/20 dark:bg-purple-900/10" />
        </div>
      </div>
    </div>
  );
}
