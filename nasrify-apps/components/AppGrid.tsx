"use client";

import React, { useState, useMemo } from "react";
import type { MarketplaceListing } from "@/types/marketplace";
import AppCard from "./AppCard";
import Link from "next/link";

interface AppGridProps {
  initialApps: MarketplaceListing[];
}

const CATEGORIES = [
  { id: "all", label: "All Apps" },
  { id: "sales", label: "Sales & Conversion" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operations" },
  { id: "support", label: "Customer Support" },
  { id: "design", label: "Store Design" },
];

export default function AppGrid({ initialApps }: AppGridProps): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"newest" | "name" | "price_asc">("newest");

  const filteredApps = useMemo(() => {
    return initialApps
      .filter((app) => {
        if (category !== "all") {
          const catLower = (app.category || "").toLowerCase();
          if (catLower !== category.toLowerCase()) return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesName = (app.name || "").toLowerCase().includes(q);
          const matchesDesc = (app.description || "").toLowerCase().includes(q);
          const matchesId = (app.appId || "").toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sort === "price_asc") {
          return (a.price || 0) - (b.price || 0);
        }
        // default newest
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [initialApps, search, category, sort]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by app name, feature, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-400 hover:text-zinc-600"
            >
              &times;
            </button>
          )}
        </div>

        {/* Category Pills & Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  category === cat.id
                    ? "bg-[#960DF2] text-white shadow-sm shadow-purple-500/20"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer focus:outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="price_asc">Sort: Price (Free first)</option>
          </select>
        </div>
      </div>

      {/* Grid of Apps */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 p-8">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-[#960DF2] flex items-center justify-center text-3xl">
            🧩
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            No Apps Found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
            We couldn&apos;t find any approved apps matching your current filter criteria. Try searching for something else or submit your own app to the marketplace.
          </p>
          <div className="flex items-center justify-center gap-3">
            {(search || category !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            <Link
              href="/developer"
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#960DF2] hover:bg-[#780AC2] shadow-sm transition-all"
            >
              Submit an App &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
