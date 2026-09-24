"use client";

import React, { useState, useEffect } from "react";
import Toggle from "@/components/ui/Toggle";
import { type CompareSettings, DEFAULT_COMPARE_SETTINGS } from "../shared/types";

interface Props {
  className?: string;
}

export default function CompareSettingsComponent({ className = "" }: Props): React.JSX.Element {
  const [settings, setSettings] = useState<CompareSettings>(DEFAULT_COMPARE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/apps/compare");
        const json = (await res.json()) as any;
        if (res.ok && json.success && json.data) {
          const rawSettings = json.data.installation?.settings;
          if (rawSettings) {
            const parsed = typeof rawSettings === "string" ? JSON.parse(rawSettings) : rawSettings;
            setSettings((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch {
        // Fallback to defaults
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setToast(null);

      const res = await fetch("/api/admin/apps/compare/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        setToast({ type: "success", message: "Compare settings saved successfully!" });
      } else {
        setToast({ type: "error", message: json.error || "Failed to save settings." });
      }
    } catch {
      setToast({ type: "error", message: "Network error while saving settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 p-6 bg-white dark:bg-[#0c140f] animate-pulse">
        <div className="h-5 w-40 bg-zinc-200 dark:bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-zinc-100 dark:bg-white/5 rounded" />
          <div className="h-10 bg-zinc-100 dark:bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className={`space-y-6 max-w-2xl ${className}`}>
      {toast && (
        <div
          role="status"
          className={`p-4 rounded-xl text-xs font-semibold ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 space-y-6 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            Compare Configuration
          </h3>
          <p className="text-xs text-zinc-500 dark:text-white/60 mt-1">
            Configure how product comparison behaves across your storefront.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80 mb-1">
              Maximum Products to Compare ({settings.maxProducts})
            </label>
            <input
              type="range"
              min={2}
              max={6}
              value={settings.maxProducts}
              onChange={(e) =>
                setSettings((s) => ({ ...s, maxProducts: parseInt(e.target.value, 10) || 4 }))
              }
              className="w-full accent-[#25D366]"
            />
            <div className="flex justify-between text-[11px] text-zinc-500 dark:text-white/50">
              <span>2 products</span>
              <span>4 products (default)</span>
              <span>6 products</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80 mb-1">
              Button Display Style
            </label>
            <select
              value={settings.buttonStyle}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  buttonStyle: e.target.value as "icon" | "icon-text",
                }))
              }
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            >
              <option value="icon-text">Icon + Text ("Compare")</option>
              <option value="icon">Icon Only</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-800 dark:text-white">
                Show In Header
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-white/60">
                Display quick access comparison indicator in navigation header
              </div>
            </div>
            <Toggle
              checked={settings.showInHeader}
              onChange={(checked) => setSettings((s) => ({ ...s, showInHeader: checked }))}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#25D366] hover:bg-[#820BD1] disabled:opacity-50 px-5 py-2 text-xs font-bold text-white shadow transition-all cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
