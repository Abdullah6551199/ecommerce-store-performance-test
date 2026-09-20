import React from "react";
import { getApprovedThemeListings } from "@/lib/themes/marketplace";
import { ThemeGrid } from "@/components/ThemeGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage(): Promise<React.JSX.Element> {
  const themes = await getApprovedThemeListings({ limit: 100 });

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-sm">
        {/* Background glow accents */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-6">
            <span>🎨</span>
            <span>Nasrify Themes Marketplace</span>
            <span className="text-zinc-400">&bull;</span>
            <span>Edge-Rendered Themes</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15] mb-6">
            Transform Your Storefront with{" "}
            <span className="bg-gradient-to-r from-[#960DF2] via-[#C06EF7] to-[#D59EFA] bg-clip-text text-transparent">
              Edge-Fast Themes
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">
            Curated, responsive storefront designs built specifically for the Nasrify eCommerce engine.
            Experience instant sub-100ms page loads, customizable color tokens, and flawless mobile conversions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#explore"
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#960DF2] hover:bg-[#780AC2] shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
            >
              Browse Themes
            </a>
            <Link
              href="/developer"
              className="px-6 py-3 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Submit a Theme &rarr;
            </Link>
          </div>

          {/* Value props badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800/80">
            <div>
              <span className="block text-xl font-black text-zinc-900 dark:text-white">
                &lt; 50ms
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Global Edge TTFB
              </span>
            </div>
            <div>
              <span className="block text-xl font-black text-zinc-900 dark:text-white">
                100 / 100
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Lighthouse Perf
              </span>
            </div>
            <div>
              <span className="block text-xl font-black text-zinc-900 dark:text-white">
                1-Click
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Admin Install
              </span>
            </div>
            <div>
              <span className="block text-xl font-black text-zinc-900 dark:text-white">
                300+
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Cloudflare PoPs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Themes Listing Section */}
      <section id="explore" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Featured Storefront Themes
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Explore verified designs, test live mockups in real-time, and install directly to your store.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
            {themes.length} {themes.length === 1 ? "Theme" : "Themes"} Live
          </span>
        </div>

        <ThemeGrid initialThemes={themes} />
      </section>
    </div>
  );
}
