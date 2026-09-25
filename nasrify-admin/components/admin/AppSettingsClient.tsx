"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import Toggle from "@/components/ui/Toggle";
import { loadAdminAppComponent } from "@/lib/apps/loader";

interface SchemaProperty {
  type: "boolean" | "string" | "number" | "select";
  default?: any;
  label?: string;
  description?: string;
  options?: Array<{ label: string; value: any }> | string[];
}

interface AppDetailsResponse {
  manifest: {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    authorUrl?: string;
    icon: string;
    pricing: "free" | "paid";
    price?: number;
    category: string;
    permissions: string[];
    extensionPoints: string[];
    databaseTables?: string[];
    settingsSchema?: Record<string, SchemaProperty>;
    changelog?: string;
  };
  installed: boolean;
  installation?: {
    id: string;
    version: string;
    enabled: boolean | number;
    installedAt: number;
    updatedAt: number;
    settings?: string | null;
  } | null;
  logs: Array<{
    id: number;
    action: string;
    performedAt: number;
    performedBy?: string | null;
    notes?: string | null;
  }>;
}

interface Props {
  appId: string;
}

export default function AppSettingsClient({ appId }: Props): React.JSX.Element {
  const [data, setData] = useState<AppDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "settings" | "overview" | "logs">("manage");
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/apps/${appId}`);
      const json = (await res.json()) as any;
      if (res.ok && json.success && json.data) {
        setData(json.data);

        // Initialize form values from installation.settings or schema defaults
        const schema = json.data.manifest?.settingsSchema || {};
        let initialValues: Record<string, any> = {};

        if (json.data.installation?.settings) {
          try {
            initialValues =
              typeof json.data.installation.settings === "string"
                ? JSON.parse(json.data.installation.settings)
                : json.data.installation.settings;
          } catch {
            initialValues = {};
          }
        }

        // Apply defaults for missing values
        for (const [key, prop] of Object.entries(schema) as [string, SchemaProperty][]) {
          if (initialValues[key] === undefined && prop.default !== undefined) {
            initialValues[key] = prop.default;
          }
        }

        setFormValues(initialValues);

        // If not installed, switch to overview tab
        if (!json.data.installed) {
          setActiveTab("overview");
        }
      } else {
        setError(json.error || `Failed to load details for app "${appId}".`);
      }
    } catch {
      setError("Network error while fetching app details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [appId]);

  const handleFieldChange = (key: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setToast(null);
      const res = await fetch(`/api/admin/apps/${appId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        setToast({ type: "success", message: "Settings saved successfully!" });
        await fetchDetails();
      } else {
        setToast({ type: "error", message: json.error || "Failed to save settings." });
      }
    } catch {
      setToast({ type: "error", message: "Network error while saving settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleInstallToggle = async (install: boolean) => {
    try {
      setActionLoading(true);
      setToast(null);
      const endpoint = install ? "/api/admin/apps/install" : "/api/admin/apps/uninstall";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      });
      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        setToast({
          type: "success",
          message: install ? "App installed successfully!" : "App uninstalled successfully.",
        });
        await fetchDetails();
      } else {
        setToast({ type: "error", message: json.error || "Action failed." });
      }
    } catch {
      setToast({ type: "error", message: "Network error during action." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <AdminLoadingSkeleton title={`Loading settings for ${appId}...`} />;
  }

  if (error || !data) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Link
          href="/admin/apps"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          &larr; Back to Apps
        </Link>
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm">
          {error || "App not found."}
        </div>
      </div>
    );
  }

  const { manifest, installed, installation, logs } = data;
  const isEnabled = Boolean(installation && installation.enabled);
  const schema = manifest.settingsSchema || {};
  const schemaKeys = Object.keys(schema);

  // App manager components
  const managerNameMap: Record<string, string> = {
    bundles: "BundlesManager",
    coupons: "CouponsManager",
    broadcast: "BroadcastManager",
    "trust-badges": "TrustBadgesManager",
    "cookie-consent": "CookieConsentManager",
    "digital-products": "DigitalProductsManager",
    reviews: "ReviewsManager",
    "product-qa": "ProductQAManager",
  };
  const CustomManagerComponent = managerNameMap[appId]
    ? loadAdminAppComponent(appId, managerNameMap[appId])
    : null;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-white/60">
          <Link href="/admin/apps" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Apps
          </Link>
          <span>/</span>
          <span className="font-semibold text-zinc-900 dark:text-white">{manifest.name}</span>
        </div>

        <Link
          href="/admin/apps"
          className="rounded-xl border border-zinc-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
        >
          &larr; All Apps
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#25D366] dark:text-zinc-400 shrink-0">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {manifest.name}
                </h1>
                <span className="rounded-full bg-zinc-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-mono text-zinc-600 dark:text-white/60">
                  v{manifest.version}
                </span>
                {installed ? (
                  isEnabled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Disabled
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-white/60 border border-zinc-200 dark:border-white/10">
                    Not Installed
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-white/60 max-w-xl">
                {manifest.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!installed ? (
              <button
                type="button"
                onClick={() => handleInstallToggle(true)}
                disabled={actionLoading}
                className="rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all"
              >
                {actionLoading ? "Installing..." : "Install App"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleInstallToggle(false)}
                disabled={actionLoading}
                className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 disabled:opacity-50 transition-all"
              >
                {actionLoading ? "Processing..." : "Uninstall"}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-zinc-100 dark:border-white/10 gap-6">
          {CustomManagerComponent && (
            <button
              type="button"
              onClick={() => setActiveTab("manage")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === "manage"
                  ? "border-[#1EA855] text-[#25D366] dark:text-zinc-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white"
              }`}
            >
              Dashboard &amp; Manage
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === "settings"
                ? "border-[#1EA855] text-[#25D366] dark:text-zinc-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white"
            }`}
          >
            Settings {schemaKeys.length > 0 && `(${schemaKeys.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === "overview"
                ? "border-[#1EA855] text-[#25D366] dark:text-zinc-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === "logs"
                ? "border-[#1EA855] text-[#25D366] dark:text-zinc-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white"
            }`}
          >
            Audit History ({logs.length})
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border animate-in fade-in duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="font-bold underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 0: CUSTOM MANAGER / DASHBOARD */}
      {activeTab === "manage" && CustomManagerComponent && (
        <div className="space-y-6">
          <CustomManagerComponent />
        </div>
      )}

      {/* TAB 1: SETTINGS */}
      {activeTab === "settings" && (
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm space-y-6">
          {!installed ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-zinc-700 dark:text-white">
                App is not currently installed.
              </p>
              <p className="text-xs text-zinc-500 dark:text-white/60 max-w-sm mx-auto">
                Please install the {manifest.name} app to configure its preferences and activate integration points.
              </p>
              <button
                type="button"
                onClick={() => handleInstallToggle(true)}
                disabled={actionLoading}
                className="mt-2 rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
              >
                Install Now
              </button>
            </div>
          ) : schemaKeys.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 dark:text-white/60">
              This app does not define any configurable settings in its manifest schema.
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="divide-y divide-zinc-100 dark:divide-white/5">
                {schemaKeys.map((key) => {
                  const prop = schema[key];
                  const value = formValues[key];

                  return (
                    <div key={key} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-md">
                        <label className="text-sm font-bold text-zinc-900 dark:text-white">
                          {prop.label || key}
                        </label>
                        {prop.description && (
                          <p className="text-xs text-zinc-500 dark:text-white/60">
                            {prop.description}
                          </p>
                        )}
                      </div>

                      <div className="sm:w-60 flex justify-start sm:justify-end">
                        {/* BOOLEAN TOGGLE */}
                        {prop.type === "boolean" && (
                          <Toggle
                            checked={Boolean(value)}
                            onChange={(checked) => handleFieldChange(key, checked)}
                            aria-label={prop.label || key}
                          />
                        )}

                        {/* NUMBER INPUT */}
                        {prop.type === "number" && (
                          <input
                            type="number"
                            value={value ?? ""}
                            onChange={(e) => handleFieldChange(key, parseFloat(e.target.value))}
                            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                          />
                        )}

                        {/* STRING INPUT */}
                        {prop.type === "string" && (
                          <input
                            type="text"
                            value={value ?? ""}
                            onChange={(e) => handleFieldChange(key, e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                          />
                        )}

                        {/* SELECT DROPDOWN */}
                        {prop.type === "select" && (
                          <select
                            value={value ?? ""}
                            onChange={(e) => handleFieldChange(key, e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                          >
                            {(prop.options || []).map((opt: any) => {
                              const label = typeof opt === "string" ? opt : opt.label;
                              const val = typeof opt === "string" ? opt : opt.value;
                              return (
                                <option key={val} value={val}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 dark:text-white/50">
                  Settings are persisted directly to the D1 installed_apps table.
                </span>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-6 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? "Saving Settings..." : "Save Settings"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white">Author &amp; Publisher</h4>
                <p className="mt-0.5 text-zinc-600 dark:text-white/70">
                  {manifest.author} {manifest.authorUrl && `(${manifest.authorUrl})`}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white">Category</h4>
                <p className="mt-0.5 text-zinc-600 dark:text-white/70 capitalize">{manifest.category}</p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white">Pricing Model</h4>
                <p className="mt-0.5 text-zinc-600 dark:text-white/70 capitalize">
                  {manifest.pricing === "free" ? "Free" : `$${manifest.price}`}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white">Permissions Requested</h4>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {manifest.permissions.map((p) => (
                    <span
                      key={p}
                      className="rounded-md bg-[#F4F4F5] dark:bg-[#18181B]/40 px-2 py-0.5 font-mono text-[10px] text-[#1EA855] dark:text-zinc-400 border border-[#E4E4E7] dark:border-zinc-800/40"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white">Extension Points Injected</h4>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {manifest.extensionPoints.map((ep) => (
                    <span
                      key={ep}
                      className="rounded-md bg-zinc-100 dark:bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-white/60 border border-zinc-200 dark:border-white/10"
                    >
                      {ep}
                    </span>
                  ))}
                </div>
              </div>

              {manifest.databaseTables && manifest.databaseTables.length > 0 && (
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">Database Tables</h4>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {manifest.databaseTables.map((tbl) => (
                      <span
                        key={tbl}
                        className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                      >
                        {tbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === "logs" && (
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Lifecycle &amp; Runtime Audit Log</h3>
          {logs.length === 0 ? (
            <p className="text-xs text-zinc-400">No activity recorded for this app yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-white/5">
              {logs.map((log) => (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                          log.action === "install"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : log.action === "uninstall"
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : log.action === "runtime_error"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-zinc-700 dark:text-white font-medium">{log.notes || ""}</span>
                    </div>
                    {log.performedBy && (
                      <p className="text-[11px] text-zinc-500 dark:text-white/50">
                        Initiated by: {log.performedBy}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                    {new Date(log.performedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
