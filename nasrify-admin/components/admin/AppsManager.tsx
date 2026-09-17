"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { AppSummary } from "@/types/apps";
import { fetchWithClientCache, invalidateClientCache } from "@/lib/client-cache";

export default function AppsManager(): React.JSX.Element {
  const [apps, setApps] = useState<AppSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "installed" | "free" | "paid">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedApp, setSelectedApp] = useState<AppSummary | null>(null);
  const [appDetailsLogs, setAppDetailsLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchApps = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const json = await fetchWithClientCache<AppSummary[]>("/api/admin/apps", { forceRefresh });
      if (json.success && Array.isArray(json.data)) {
        setApps(json.data);
      } else {
        setError(json.error || "Failed to load apps list.");
      }
    } catch {
      setError("Network error while loading apps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleInstall = async (appId: string) => {
    try {
      setActionLoading(appId);
      setMessage(null);
      const res = await fetch("/api/admin/apps/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      });
      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        setMessage({ type: "success", text: `App "${appId}" installed successfully!` });
        invalidateClientCache("/api/admin/apps");
        await fetchApps(true);
      } else {
        setMessage({ type: "error", text: json.error || "Failed to install app." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during installation." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUninstall = async (appId: string) => {
    if (!confirm(`Are you sure you want to uninstall "${appId}"? All app database records will be preserved safely.`)) {
      return;
    }
    try {
      setActionLoading(appId);
      setMessage(null);
      const res = await fetch("/api/admin/apps/uninstall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      });
      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        setMessage({ type: "success", text: `App "${appId}" uninstalled successfully.` });
        invalidateClientCache("/api/admin/apps");
        await fetchApps(true);
      } else {
        setMessage({ type: "error", text: json.error || "Failed to uninstall app." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during uninstallation." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (appId: string, currentEnabled: boolean) => {
    try {
      setActionLoading(appId);
      setMessage(null);
      const res = await fetch("/api/admin/apps/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, enabled: !currentEnabled }),
      });
      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        setMessage({
          type: "success",
          text: `App "${appId}" ${!currentEnabled ? "enabled" : "disabled"} successfully.`,
        });
        invalidateClientCache("/api/admin/apps");
        await fetchApps(true);
      } else {
        setMessage({ type: "error", text: json.error || "Failed to toggle app." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during status change." });
    } finally {
      setActionLoading(null);
    }
  };

  const openAppDetails = async (app: AppSummary) => {
    setSelectedApp(app);
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/apps/${app.id}`);
      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        setAppDetailsLogs(json.data.logs || []);
      }
    } catch {
      setAppDetailsLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // Tab filter
      if (activeTab === "installed" && !app.installed) return false;
      if (activeTab === "free" && app.pricing !== "free") return false;
      if (activeTab === "paid" && app.pricing !== "paid") return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = app.name.toLowerCase().includes(query);
        const matchDesc = app.description.toLowerCase().includes(query);
        const matchCategory = app.category.toLowerCase().includes(query);
        return matchName || matchDesc || matchCategory;
      }
      return true;
    });
  }, [apps, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold hover:underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-sm border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex rounded-xl bg-zinc-100 dark:bg-white/5 p-1 border border-zinc-200 dark:border-white/10">
          {(
            [
              { id: "all", label: "All Apps" },
              { id: "installed", label: "Installed" },
              { id: "free", label: "Free" },
              { id: "paid", label: "Paid" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-purple-900/60 text-purple-900 dark:text-purple-100 shadow-sm"
                  : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
              {tab.id === "installed" && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-[10px] text-purple-700 dark:text-purple-300 font-mono">
                  {apps.filter((a) => a.installed).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] px-3.5 py-2 pl-9 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Apps Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 animate-pulse"
            />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-white/10 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.439 7.85c0-1.57.88-2.35 1.56-2.35 1.4 0 2 1.5 2 3s-.6 3-2 3c-.68 0-1.56-.78-1.56-2.35V7.85zM11 4a2 2 0 1 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 1 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 1 0-4 0v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a2 2 0 1 1 0-4h1a1 1 0 0 0 1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1V4z" />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-bold text-zinc-900 dark:text-white">No apps found</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-white/60">
            {searchQuery ? "Try adjusting your search query." : "No apps match this tab filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredApps.map((app) => {
            const isInstalled = app.installed;
            const isEnabled = app.enabled;
            const isProcessing = actionLoading === app.id;

            return (
              <div
                key={app.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm hover:border-purple-300 dark:hover:border-purple-800/80 transition-all"
              >
                <div>
                  {/* Header Row: Icon, Title, Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 1 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 1 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 1 0-4 0v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a2 2 0 1 1 0-4h1a1 1 0 0 0 1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                            {app.name}
                          </h3>
                          <span className="rounded-md bg-zinc-100 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-white/70">
                            v{app.version}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-white/50">
                          by <span className="font-medium">{app.author}</span> &bull; {app.category}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isInstalled ? (
                        isEnabled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Installed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Disabled
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-white/60 border border-zinc-200 dark:border-white/10">
                          Not installed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs text-zinc-600 dark:text-white/70 line-clamp-2">
                    {app.description}
                  </p>

                  {/* Badges: Pricing & Extension Points */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300">
                      {app.pricing === "free" ? "Free" : `$${app.price}`}
                    </span>
                    {app.extensionPoints.map((ep) => (
                      <span
                        key={ep}
                        className="rounded-md bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:text-white/50"
                      >
                        {ep}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Row */}
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between gap-3">
                  <Link
                    href={`/admin/apps/${app.id}`}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {isInstalled ? "Configure & Settings \u2192" : "View Details \u2192"}
                  </Link>

                  <div className="flex items-center gap-2">
                    {!isInstalled ? (
                      <button
                        onClick={() => handleInstall(app.id)}
                        disabled={isProcessing}
                        className="rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all"
                      >
                        {isProcessing ? "Installing..." : "Install"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggle(app.id, isEnabled)}
                          disabled={isProcessing}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold border disabled:opacity-50 transition-all ${
                            isEnabled
                              ? "border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 hover:bg-amber-100"
                              : "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {isProcessing ? "Updating..." : isEnabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleUninstall(app.id)}
                          disabled={isProcessing}
                          className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 disabled:opacity-50 transition-all"
                        >
                          Uninstall
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Audit Logs Modal */}
      {selectedApp && (
        <div
          onClick={() => setSelectedApp(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {selectedApp.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-white/60">
                  ID: <span className="font-mono">{selectedApp.id}</span> &bull; v{selectedApp.version}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-zinc-700 dark:text-white/80">Description:</span>
                <p className="mt-0.5 text-zinc-600 dark:text-white/60">{selectedApp.description}</p>
              </div>

              <div>
                <span className="font-semibold text-zinc-700 dark:text-white/80">Permissions Declared:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedApp.permissions.length > 0 ? (
                    selectedApp.permissions.map((p) => (
                      <span
                        key={p}
                        className="rounded-md bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 font-mono text-[10px] text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40"
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-400">None</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-zinc-700 dark:text-white/80">Extension Points:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedApp.extensionPoints.map((ep) => (
                    <span
                      key={ep}
                      className="rounded-md bg-zinc-100 dark:bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-white/60 border border-zinc-200 dark:border-white/10"
                    >
                      {ep}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audit Logs */}
              <div className="pt-2 border-t border-zinc-100 dark:border-white/10">
                <span className="font-semibold text-zinc-700 dark:text-white/80">Installation Audit History:</span>
                {loadingLogs ? (
                  <p className="mt-1 text-zinc-400">Loading audit trail...</p>
                ) : appDetailsLogs.length === 0 ? (
                  <p className="mt-1 text-zinc-400">No activity recorded yet.</p>
                ) : (
                  <div className="mt-2 max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {appDetailsLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="rounded-lg bg-zinc-50 dark:bg-white/5 p-2 text-[11px] flex items-center justify-between"
                      >
                        <div>
                          <span
                            className={`font-semibold uppercase tracking-wider text-[10px] mr-2 ${
                              log.action === "install"
                                ? "text-emerald-600"
                                : log.action === "uninstall"
                                ? "text-red-500"
                                : "text-amber-500"
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-zinc-600 dark:text-white/60">{log.notes || ""}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {new Date(log.performedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-xl bg-zinc-100 dark:bg-white/10 px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-white hover:bg-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
