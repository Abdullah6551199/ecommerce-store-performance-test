import React from "react";
import { getApprovedListings } from "@/lib/marketplace/listings";
import AppGrid from "@/components/AppGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MarketplacePage(): Promise<React.JSX.Element> {
  const initialApps = await getApprovedListings();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3C0561] via-[#5A0891] to-[#780AC2] p-8 sm:p-12 text-white shadow-xl shadow-purple-950/20">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-purple-200 backdrop-blur-md border border-white/15">
            <span>✨</span>
            <span>Modular Apps Architecture · Zero Monolith Bloat</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Supercharge Your Store with Verified Apps
          </h1>

          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
            Discover production-ready apps designed for high-conversion storefronts. One-click install directly into your admin dashboard, fully edge-isolated with zero CPU overhead.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/developer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-[#5A0891] hover:bg-purple-50 shadow-md transition-all cursor-pointer"
            >
              <span>Build &amp; Submit an App</span>
              <span>&rarr;</span>
            </Link>

            <a
              href="https://nasrify-admin.zia291930.workers.dev/admin/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Manage Installed Apps</span>
              <span className="text-[10px]">&nearr;</span>
            </a>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />
        <div className="absolute right-20 -bottom-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-2xl pointer-events-none" />
      </section>

      {/* Value Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Edge Performance", desc: "Native Cloudflare Workers", icon: "⚡" },
          { title: "1-Click Direct Install", desc: "No manual code injection", icon: "🚀" },
          { title: "Isolated Extension Points", desc: "Safe app sandboxing", icon: "🛡️" },
          { title: "Automatic Updates", desc: "Sub-5s settings reflection", icon: "🔄" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg shrink-0">
              {item.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{item.title}</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Apps Grid Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Featured Marketplace Apps
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            All apps undergo security review and strict sandboxing checks before being listed.
          </p>
        </div>

        <AppGrid initialApps={initialApps} />
      </section>
    </div>
  );
}
