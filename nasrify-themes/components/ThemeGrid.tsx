"use client";

import React, { useState, useMemo } from "react";
import type { ThemeMarketplaceListing } from "@/types/themes";
import { ThemeCard } from "./ThemeCard";

const CATEGORIES = [
  "All",
  "Minimal",
  "Bold",
  "Luxury",
  "Fashion",
  "Kids",
  "Corporate",
  "Organic",
];

interface ThemeGridProps {
  initialThemes: ThemeMarketplaceListing[];
  defaultCategory?: string;
}

export function ThemeGrid({
  initialThemes,
  defaultCategory = "All",
}: ThemeGridProps): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [sort, setSort] = useState<"newest" | "name" | "price_asc" | "price_desc">("newest");

  const filteredThemes = useMemo(() => {
    return initialThemes
      .filter((theme) => {
        // Category filter
        if (
          selectedCategory !== "All" &&
          theme.category?.toLowerCase() !== selectedCategory.toLowerCase()
        ) {
          return false;
        }

        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = theme.name.toLowerCase().includes(q);
          const matchDesc = theme.description?.toLowerCase().includes(q) || false;
          const matchAuthor = theme.author?.toLowerCase().includes(q) || false;
          const matchId = theme.themeId.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchAuthor && !matchId) {
            return false;
          }
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
        if (sort === "price_desc") {
          return (b.price || 0) - (a.price || 0);
        }
        // newest
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [initialThemes, selectedCategory, search, sort]);

  return (
    <div className="space-y-8">
      {/* Search & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search themes by name, style, or author..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="name">Theme Name (A-Z)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#960DF2] text-white shadow-md shadow-purple-500/25"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Themes Grid */}
      {filteredThemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-3xl mx-auto mb-4">
            🎨
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            No themes found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
            We couldn&apos;t find any themes matching &quot;{search || selectedCategory}&quot;. Try adjusting your search query or browsing all categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#960DF2] hover:bg-[#780AC2] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default ThemeGrid;
