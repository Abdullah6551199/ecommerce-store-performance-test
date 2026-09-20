"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { ThemeMarketplaceListing, ThemeConfig } from "@/types/themes";
import { ThemeMockupPreview } from "./ThemeMockupPreview";

interface ThemeCardProps {
  theme: ThemeMarketplaceListing;
  ratingSummary?: { averageRating: number; totalReviews: number } | null;
}

export function ThemeCard({ theme, ratingSummary }: ThemeCardProps): React.JSX.Element {
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [summary, setSummary] = useState<{ averageRating: number; totalReviews: number } | null>(
    ratingSummary || null
  );

  useEffect(() => {
    if (ratingSummary) return;
    fetch(`/api/marketplace/reviews/summary?type=theme&listingId=${theme.id}`)
      .then((r) => r.json())
      .then((d: any) => {
        if (d?.success && d?.summary) setSummary(d.summary);
      })
      .catch(() => {});
  }, [theme.id, ratingSummary]);

  const isFree = !theme.pricing || theme.pricing === "free" || !theme.price || theme.price === 0;

  let config: ThemeConfig = {};
  if (theme.configJson) {
    try {
      config = JSON.parse(theme.configJson);
    } catch {
      config = {};
    }
  }

  const primaryColor = config.colors?.primary || "#780AC2";
  const secondaryColor = config.colors?.secondary || "#960DF2";
  const accentColor = config.colors?.accent || "#C06EF7";

  return (
    <>
      <div className="group flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-500/50 dark:hover:border-purple-500/40 transition-all duration-200">
        {/* Preview image / Banner container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800/80">
          {theme.previewUrl ? (
            <img
              src={theme.previewUrl}
              alt={theme.name}
              className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="h-full w-full flex flex-col items-center justify-center p-6 text-center"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}22 0%, ${secondaryColor}33 100%)`,
              }}
            >
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-md mb-2"
                style={{ backgroundColor: primaryColor }}
              >
                🎨
              </div>
              <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                {theme.name}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Live Storefront Theme
              </span>
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 backdrop-blur-sm shadow-sm">
              {theme.category || "Minimal"}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm ${
                isFree
                  ? "bg-emerald-500/90 text-white"
                  : "bg-purple-600/90 text-white"
              }`}
            >
              {isFree ? "Free" : `$${theme.price?.toFixed(2)}`}
            </span>
          </div>

          {/* Quick Preview Hover Overlay Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
            <button
              type="button"
              onClick={() => setShowQuickPreview(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <span>👁️</span>
              <span>Quick Preview</span>
            </button>
            <Link
              href={`/themes/${theme.themeId}`}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <span>Details</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <Link href={`/themes/${theme.themeId}`} className="hover:underline">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {theme.name}
                </h3>
              </Link>
              <span className="font-mono text-[10px] text-zinc-400">v{theme.version}</span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 truncate">
              by {theme.author || "Nasrify Design Partner"}
            </p>

            {/* Small star + count under theme name */}
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">
              <span className="text-amber-400 text-xs">★</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {summary && summary.totalReviews > 0 ? summary.averageRating.toFixed(1) : "5.0"}
              </span>
              <span className="text-zinc-400">
                ({summary ? summary.totalReviews : 0})
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed mb-4">
              {theme.description || "A responsive, high-performance storefront theme built for edge conversion."}
            </p>
          </div>

          {/* Palette Preview + Footer Bar */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5" title="Theme Palette">
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/10 inline-block shadow-sm"
                style={{ backgroundColor: primaryColor }}
              />
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/10 inline-block shadow-sm"
                style={{ backgroundColor: secondaryColor }}
              />
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/10 inline-block shadow-sm"
                style={{ backgroundColor: accentColor }}
              />
            </div>

            <Link
              href={`/themes/${theme.themeId}`}
              className="text-[#960DF2] dark:text-[#D59EFA] font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
            >
              <span>Explore</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {showQuickPreview && (
        <ThemeMockupPreview
          theme={theme}
          isModal={true}
          onClose={() => setShowQuickPreview(false)}
        />
      )}
    </>
  );
}

export default ThemeCard;
