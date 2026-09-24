"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuditLogItem {
  id: string;
  action: string;
  performedBy: string | null;
  createdAt: number | null;
}

interface ThemeDetail {
  id: string;
  slug: string;
  name: string;
  version: string;
  description: string | null;
  author: string | null;
  category: string | null;
  themeJson: string;
  isBuiltIn: number;
  status: string;
  isActive: boolean;
  createdAt: number | null;
  updatedAt: number | null;
  auditLogs?: AuditLogItem[];
}

export default function ThemeDetailView({ themeId }: { themeId: string }) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/themes/${themeId}`);
      const data: any = await res.json();
      if (data.success && data.theme) {
        setTheme(data.theme);
      } else {
        setMessage({ type: "error", text: data.error || "Theme not found" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to load theme details" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, [themeId]);

  const handleActivate = async () => {
    if (!theme || theme.isActive) return;
    try {
      setActivating(true);
      const res = await fetch("/api/admin/themes/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: theme.id }),
      });
      const data: any = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Theme "${theme.name}" is now live!` });
        await fetchTheme();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to activate theme" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to activate" });
    } finally {
      setActivating(false);
    }
  };

  const handleCopyJson = () => {
    if (!theme) return;
    try {
      const formatted = JSON.stringify(JSON.parse(theme.themeJson), null, 2);
      navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      navigator.clipboard.writeText(theme.themeJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-500">Loading theme configuration...</div>;
  }

  if (!theme) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm text-red-500">Theme could not be found or was deleted.</p>
        <Link href="/admin/themes" className="text-sm font-semibold text-blue-600 hover:underline">
          &larr; Back to Themes
        </Link>
      </div>
    );
  }

  let formattedJson = theme.themeJson;
  try {
    formattedJson = JSON.stringify(JSON.parse(theme.themeJson), null, 2);
  } catch {}

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-4">
        <div>
          <Link
            href="/admin/themes"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-flex items-center gap-1"
          >
            &larr; Back to Themes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {theme.name}
            </h1>
            {theme.isActive ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                ACTIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                Inactive
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {theme.isBuiltIn === 1 ? "Built-in" : "Custom"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Slug: <code className="text-xs bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{theme.slug}</code> • Version: v{theme.version}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 transition-colors"
          >
            Preview Storefront
          </a>

          {!theme.isActive && (
            <button
              type="button"
              onClick={handleActivate}
              disabled={activating}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-xs"
            >
              {activating ? "Activating..." : "Activate Theme"}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Grid: JSON & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* JSON Viewer */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Theme Configuration (JSON)
            </h2>
            <button
              type="button"
              onClick={handleCopyJson}
              className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy JSON"}
            </button>
          </div>

          <div className="relative rounded-xl border border-gray-200 dark:border-zinc-800 bg-zinc-950 p-4 overflow-x-auto shadow-inner">
            <pre className="text-xs font-mono text-zinc-100 leading-relaxed max-h-[600px] overflow-y-auto">
              <code>{formattedJson}</code>
            </pre>
          </div>
        </div>

        {/* Sidebar: Details & Audit Log */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">
              Theme Details
            </h3>
            <div className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Author:</span>
                <span className="font-medium">{theme.author || "Nasrify"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="font-medium capitalize">{theme.category || "General"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-medium capitalize">{theme.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="font-medium">{theme.isBuiltIn === 1 ? "System Built-in" : "Custom Template"}</span>
              </div>
              {theme.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span>{new Date(theme.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Audit History Card */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">
              Activation & Audit History
            </h3>
            {theme.auditLogs && theme.auditLogs.length > 0 ? (
              <div className="space-y-3">
                {theme.auditLogs.map((log) => (
                  <div key={log.id} className="text-xs flex items-start gap-2 border-b border-gray-50 dark:border-zinc-800/50 pb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {log.action}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        by {log.performedBy || "admin"} • {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-2">No historical events recorded for this theme yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
