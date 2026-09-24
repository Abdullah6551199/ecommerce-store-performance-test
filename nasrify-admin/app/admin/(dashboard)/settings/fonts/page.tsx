"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface FontItem {
  id: string;
  slug: string;
  family: string;
  category: string;
  variants: number[];
  styles: string[];
  subsets: string[];
  license: string;
  source: string;
  is_curated: boolean;
  is_active: boolean;
  totalSizeKb: number;
}

const CATEGORIES = ["All", "sans", "serif", "display", "handwriting", "mono"];

export default function FontsManagerPage() {
  const [fonts, setFonts] = useState<FontItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [curatedOnly, setCuratedOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchFonts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (curatedOnly) params.set("curated", "1");
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/fonts?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        setFonts(data.fonts || []);
      }
    } catch (err) {
      showToast("Error loading fonts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, [curatedOnly, selectedCategory, search]);

  const toggleCurated = async (font: FontItem) => {
    try {
      const nextVal = !font.is_curated;
      const res = await fetch("/api/admin/fonts/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontId: font.id, isCurated: nextVal }),
      });

      if (res.ok) {
        setFonts((prev) =>
          prev.map((f) => (f.id === font.id ? { ...f, is_curated: nextVal } : f))
        );
        showToast(`${font.family} ${nextVal ? "added to" : "removed from"} Curated list`);
      } else {
        showToast("Failed to update curated status");
      }
    } catch {
      showToast("Network error updating font");
    }
  };

  const handleSyncFull = async () => {
    try {
      const res = await fetch("/api/admin/fonts/sync", { method: "POST" });
      const data = (await res.json()) as any;
      showToast(data.message || "Sync scheduled");
    } catch {
      showToast("Failed to initiate sync");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-xl animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Font System & Library
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
              R2 Hosted
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Local zero-dependency typography served from Cloudflare R2 with automatic subsetting and preloading.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/theme-editor"
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors"
          >
            Open Theme Editor
          </Link>

          <button
            type="button"
            onClick={handleSyncFull}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Sync Full Google Fonts (300+)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800 mx-1" />

          <button
            type="button"
            onClick={() => setCuratedOnly(!curatedOnly)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              curatedOnly
                ? "bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>★</span>
            <span>Curated ({fonts.filter((f) => f.is_curated).length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search fonts by family name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Font Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-indigo-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading typography catalog...</span>
        </div>
      ) : fonts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white">No fonts found</p>
          <p className="text-xs text-gray-500 mt-1">Try changing search query or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fonts.map((f) => (
            <div
              key={f.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-150"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {f.family}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                        {f.category}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {f.totalSizeKb} KB
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCurated(f)}
                    title={f.is_curated ? "Remove from Curated list" : "Add to Curated list"}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      f.is_curated
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    ★
                  </button>
                </div>

                {/* Sample Preview Text */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-950/60 border border-gray-100 dark:border-zinc-800/60 my-2">
                  <p
                    style={{ fontFamily: `"${f.family}", sans-serif` }}
                    className="text-base text-gray-800 dark:text-gray-200 truncate leading-relaxed"
                  >
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p
                    style={{ fontFamily: `"${f.family}", sans-serif`, fontWeight: 700 }}
                    className="text-xs text-gray-500 mt-1 truncate"
                  >
                    ABCDEF 0123456789 &amp; Special Characters
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-gray-500">
                <span>Weights: {f.variants.join(", ")}</span>
                <span className="font-mono text-[10px] text-emerald-500">✓ R2 Local</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
