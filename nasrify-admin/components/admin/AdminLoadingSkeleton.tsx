import React from "react";

export default function AdminLoadingSkeleton({
  title = "Loading Module...",
}: {
  title?: string;
}): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="flex items-center justify-between">
        <div className="h-9 w-64 rounded-xl bg-[#DCFCE7]/60 dark:bg-[#18181B]/40" />
        <div className="h-9 w-32 rounded-xl bg-[#DCFCE7]/40 dark:bg-[#18181B]/30" />
      </div>
      <div className="rounded-2xl border border-[#E4E4E7]/60 dark:border-zinc-800/40 bg-white dark:bg-[#200435] p-6 space-y-4 shadow-sm">
        <div className="h-6 w-48 rounded-lg bg-[#DCFCE7]/50 dark:bg-[#18181B]/30" />
        <div className="h-20 w-full rounded-xl bg-[#DCFCE7]/50 dark:bg-[#18181B]/20" />
        <div className="space-y-2 pt-4">
          <div className="h-10 w-full rounded-lg bg-[#DCFCE7]/40 dark:bg-[#18181B]/20" />
          <div className="h-10 w-full rounded-lg bg-[#DCFCE7]/30 dark:bg-[#18181B]/10" />
          <div className="h-10 w-full rounded-lg bg-[#DCFCE7]/20 dark:bg-[#18181B]/10" />
        </div>
      </div>
    </div>
  );
}
