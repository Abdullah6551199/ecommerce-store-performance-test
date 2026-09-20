import React from "react";
import Link from "next/link";
import type { MarketplaceListing } from "@/types/marketplace";

interface AppCardProps {
  app: MarketplaceListing;
}

export function AppCard({ app }: AppCardProps): React.JSX.Element {
  const isFree = !app.pricing || app.pricing === "free" || !app.price || app.price === 0;

  return (
    <Link
      href={`/apps/${app.appId}`}
      className="group flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 shadow-sm hover:shadow-md hover:border-purple-500/50 dark:hover:border-purple-500/40 transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Top bar: Category + Price Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            {app.category || "General"}
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isFree
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
            }`}
          >
            {isFree ? "Free" : `$${app.price?.toFixed(2)}`}
          </span>
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-950/60 dark:to-zinc-800 border border-purple-200/50 dark:border-purple-800/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            {app.iconUrl ? (
              <img src={app.iconUrl} alt={app.name} className="h-8 w-8 object-contain" />
            ) : (
              <span className="text-xl">📦</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {app.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              by {app.author || "Nasrify Partner"}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed mb-4">
          {app.description || "Extend your storefront and optimize workflows with this verified app."}
        </p>
      </div>

      {/* Footer bar */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        <span className="font-mono text-[11px]">v{app.version}</span>
        <span className="text-[#960DF2] dark:text-[#D59EFA] font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
          <span>View App</span>
          <span>&rarr;</span>
        </span>
      </div>
    </Link>
  );
}
export default AppCard;
