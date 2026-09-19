"use client";

import React, { useState, useEffect } from "react";
import type { OrderTrackingAppSettings } from "../shared/types";
import { DEFAULT_ORDER_TRACKING_SETTINGS } from "../shared/types";

export default function OrderTrackingSettings(): React.JSX.Element {
  const [settings, setSettings] = useState<OrderTrackingAppSettings>(DEFAULT_ORDER_TRACKING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/apps/order-tracking/settings");
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.success && data.data) {
            setSettings({
              ...DEFAULT_ORDER_TRACKING_SETTINGS,
              ...data.data,
            });
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
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/apps/order-tracking/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings.");
      }

      setMessage({ type: "success", text: "Order Tracking settings saved successfully." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400 dark:text-zinc-500">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-[#960DF2] mb-2" />
        <p className="text-xs font-mono">Loading settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl text-zinc-900 dark:text-white">
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Enable Public Tracking */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
        <div>
          <label className="text-sm font-bold block text-zinc-900 dark:text-white">
            Enable Public Tracking
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Allow customers to track order progress on /track-order without logging in.
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.enablePublicTracking}
          onChange={(e) => setSettings({ ...settings, enablePublicTracking: e.target.checked })}
          className="h-5 w-5 rounded border-zinc-300 text-[#960DF2] focus:ring-[#960DF2] accent-[#960DF2] cursor-pointer"
        />
      </div>

      {/* Auto Status Notifications */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
        <div>
          <label className="text-sm font-bold block text-zinc-900 dark:text-white">
            Auto Status Notifications
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Automatically dispatch notification alerts to customer accounts when fulfillment status changes.
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.enableAutoNotifications}
          onChange={(e) => setSettings({ ...settings, enableAutoNotifications: e.target.checked })}
          className="h-5 w-5 rounded border-zinc-300 text-[#960DF2] focus:ring-[#960DF2] accent-[#960DF2] cursor-pointer"
        />
      </div>

      {/* Show Courier Field */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
        <div>
          <label className="text-sm font-bold block text-zinc-900 dark:text-white">
            Show Courier Details
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Display courier name and tracking code in the shipment progress timeline.
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.showCourierField}
          onChange={(e) => setSettings({ ...settings, showCourierField: e.target.checked })}
          className="h-5 w-5 rounded border-zinc-300 text-[#960DF2] focus:ring-[#960DF2] accent-[#960DF2] cursor-pointer"
        />
      </div>

      {/* Show Timeline */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
        <div>
          <label className="text-sm font-bold block text-zinc-900 dark:text-white">
            Show Visual Step Timeline
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Display the visual 6-stage timeline progression steps on tracking pages.
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.showTimeline}
          onChange={(e) => setSettings({ ...settings, showTimeline: e.target.checked })}
          className="h-5 w-5 rounded border-zinc-300 text-[#960DF2] focus:ring-[#960DF2] accent-[#960DF2] cursor-pointer"
        />
      </div>

      {/* Estimated Delivery Days */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 space-y-2">
        <label className="text-sm font-bold block text-zinc-900 dark:text-white">
          Default Estimated Delivery Timeframe (Days)
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Estimated transit business days shown to customers when no explicit carrier date is set.
        </p>
        <input
          type="number"
          min={1}
          max={30}
          value={settings.estimatedDeliveryDays}
          onChange={(e) => setSettings({ ...settings, estimatedDeliveryDays: parseInt(e.target.value) || 5 })}
          className="w-32 rounded-xl border border-zinc-300 dark:border-white/20 bg-white dark:bg-black/60 px-3 py-2 text-sm text-zinc-900 dark:text-white font-mono"
        />
      </div>

      {/* Timeline Stages */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 space-y-2">
        <label className="text-sm font-bold block text-zinc-900 dark:text-white">
          Fulfillment Stages (Comma-Separated)
        </label>
        <input
          type="text"
          value={settings.timelineStages}
          onChange={(e) => setSettings({ ...settings, timelineStages: e.target.value })}
          className="w-full rounded-xl border border-zinc-300 dark:border-white/20 bg-white dark:bg-black/60 px-3 py-2 text-sm text-zinc-900 dark:text-white font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-3 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 transition disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving Changes..." : "Save Configuration"}
      </button>
    </form>
  );
}
