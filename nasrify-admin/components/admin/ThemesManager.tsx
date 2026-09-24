"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface ThemeItem {
  id: string;
  slug: string;
  name: string;
  version: string;
  description: string | null;
  author: string | null;
  authorUrl: string | null;
  previewUrl: string | null;
  category: string | null;
  isBuiltIn: number;
  status: string;
  isActive: boolean;
  createdAt: number | null;
  updatedAt: number | null;
}

export default function ThemesManager() {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "builtin" | "custom">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/themes?filter=${filter}`);
      const data: any = await res.json();
      if (data.success) {
        setThemes(data.themes || []);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load themes" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error loading themes" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [filter]);

  const handleActivate = async (theme: ThemeItem) => {
    if (theme.isActive) return;
    try {
      setActionLoading(`activate-${theme.id}`);
      const res = await fetch("/api/admin/themes/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: theme.id }),
      });
      const data: any = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Theme "${theme.name}" activated successfully!` });
        await fetchThemes();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to activate theme" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to activate theme" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (theme: ThemeItem) => {
    try {
      setActionLoading(`duplicate-${theme.id}`);
      const res = await fetch(`/api/admin/themes/${theme.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data: any = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Theme duplicated as "${data.theme.name}"` });
        await fetchThemes();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to duplicate theme" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to duplicate theme" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (theme: ThemeItem) => {
    if (!confirm(`Are you sure you want to delete custom theme "${theme.name}"?`)) {
      return;
    }
    try {
      setActionLoading(`delete-${theme.id}`);
      const res = await fetch(`/api/admin/themes/${theme.id}`, {
        method: "DELETE",
      });
      const data: any = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Theme "${theme.name}" deleted.` });
        await fetchThemes();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete theme" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete theme" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Themes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your store themes, inspect templates, and switch active designs seamlessly.
          </p>
        </div>

        {/* Storefront View Button */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white transition-colors"
          >
            <span>View Live Store</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Alert message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
        {(["all", "builtin", "custom"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
              filter === tab
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
          >
            {tab === "builtin" ? "Built-in" : tab}
          </button>
        ))}
      </div>

      {/* Themes Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading themes...
        </div>
      ) : themes.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-500">
          No themes found under this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const isActivating = actionLoading === `activate-${theme.id}`;
            const isDuplicating = actionLoading === `duplicate-${theme.id}`;
            const isDeleting = actionLoading === `delete-${theme.id}`;

            return (
              <div
                key={theme.id}
                className={`relative flex flex-col rounded-xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all ${
                  theme.isActive
                    ? "border-blue-600 ring-2 ring-blue-600/20"
                    : "border-gray-200 dark:border-zinc-800 hover:shadow-md"
                }`}
              >
                {/* Preview Image / Placeholder */}
                <div className="relative aspect-16/10 w-full bg-gray-100 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden group">
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-xl font-black text-white tracking-tight">
                      {theme.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      v{theme.version} • {theme.category || "General"}
                    </span>
                  </div>

                  {/* Active Badge */}
                  {theme.isActive && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      ACTIVE
                    </span>
                  )}

                  {/* Built-in vs Custom Badge */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                    {theme.isBuiltIn === 1 ? "Built-in" : "Custom"}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white">
                        {theme.name}
                      </h3>
                      <span className="text-xs font-mono text-gray-500">v{theme.version}</span>
                    </div>
                    {theme.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {theme.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {theme.isActive ? (
                        <button
                          type="button"
                          disabled
                          className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default flex items-center justify-center gap-1"
                        >
                          ✓ Currently Live
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActivate(theme)}
                          disabled={isActivating}
                          className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                        >
                          {isActivating ? "Activating..." : "Activate"}
                        </button>
                      )}

                      <Link
                        href={`/admin/themes/${theme.id}`}
                        className="py-2 px-3 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        Inspect
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(theme)}
                        disabled={isDuplicating}
                        className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                      >
                        {isDuplicating ? "Cloning..." : "Duplicate"}
                      </button>

                      {theme.isBuiltIn === 0 && !theme.isActive && (
                        <button
                          type="button"
                          onClick={() => handleDelete(theme)}
                          disabled={isDeleting}
                          className="hover:text-red-600 transition-colors"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
