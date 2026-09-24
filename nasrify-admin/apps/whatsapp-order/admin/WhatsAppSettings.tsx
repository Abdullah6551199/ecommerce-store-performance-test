"use client";

import React, { useState, useEffect } from "react";
import Toggle from "@/components/ui/Toggle";
import { WhatsAppOrderSettings, DEFAULT_WHATSAPP_SETTINGS } from "../shared/types";
import { formatWhatsAppUrl, sanitizePhoneNumber, isValidPhoneNumber } from "../lib/whatsapp";

interface Props {
  className?: string;
}

export default function WhatsAppSettings({ className = "" }: Props): React.JSX.Element {
  const [settings, setSettings] = useState<WhatsAppOrderSettings>(DEFAULT_WHATSAPP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/apps/whatsapp-order");
        const json = (await res.json()) as any;
        if (res.ok && json.success && json.data) {
          const rawSettings = json.data.installation?.settings;
          if (rawSettings) {
            const parsed = typeof rawSettings === "string" ? JSON.parse(rawSettings) : rawSettings;
            setSettings((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch (err) {
        console.error("Failed to load WhatsApp settings:", err);
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

      const res = await fetch("/api/admin/apps/whatsapp-order/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        setToast({ type: "success", message: "WhatsApp settings saved successfully!" });
      } else {
        setToast({ type: "error", message: json.error || "Failed to save settings." });
      }
    } catch (err) {
      setToast({ type: "error", message: "Network error while saving settings." });
    } finally {
      setSaving(false);
    }
  };

  const testUrl = settings.phoneNumber
    ? formatWhatsAppUrl(settings.phoneNumber, settings.floatingMessage)
    : "";

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        Loading WhatsApp settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className={`space-y-6 max-w-2xl ${className}`}>
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
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

      {/* Phone Configuration Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          WhatsApp Business Account
        </h3>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80 mb-1">
            WhatsApp Phone Number (with Country Code)
          </label>
          <input
            type="text"
            value={settings.phoneNumber}
            onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
            placeholder="e.g. 15551234567 or 447123456789"
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366] font-mono"
          />
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-white/50">
            Enter full phone number with country prefix. Do not add &quot;+&quot; or dashes (sanitized automatically:{" "}
            <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
              {sanitizePhoneNumber(settings.phoneNumber) || "none"}
            </span>
            ).
          </p>
          {settings.phoneNumber && !isValidPhoneNumber(settings.phoneNumber) && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              Warning: Phone number should be between 7 and 15 digits.
            </p>
          )}
        </div>

        {testUrl && (
          <div className="pt-2 flex items-center gap-2">
            <a
              href={testUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
              </svg>
              Test WhatsApp Link in new tab &rarr;
            </a>
          </div>
        )}
      </div>

      {/* Feature Toggles Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          Display &amp; Visibility
        </h3>

        <div className="divide-y divide-zinc-100 dark:divide-white/5">
          <div className="py-3 first:pt-0">
            <Toggle
              checked={settings.enableFloating}
              onChange={(val) => setSettings({ ...settings, enableFloating: val })}
              label="Floating WhatsApp Button"
              description="Display a fixed WhatsApp button at the bottom-right corner of all storefront pages."
            />
          </div>

          <div className="py-3 last:pb-0">
            <Toggle
              checked={settings.enableProductButton}
              onChange={(val) => setSettings({ ...settings, enableProductButton: val })}
              label="Product Page 'Order on WhatsApp' Button"
              description="Render an order button directly below product details with auto-filled product information."
            />
          </div>
        </div>
      </div>

      {/* Message Templates Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          Message Templates
        </h3>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80 mb-1">
            Floating Chat Message
          </label>
          <textarea
            rows={2}
            value={settings.floatingMessage}
            onChange={(e) => setSettings({ ...settings, floatingMessage: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80 mb-1">
            Product Order Message Template
          </label>
          <textarea
            rows={2}
            value={settings.productMessage}
            onChange={(e) => setSettings({ ...settings, productMessage: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          />
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span>Placeholders:</span>
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[#25D366] dark:text-zinc-400">
              {"{product_name}"}
            </code>
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[#25D366] dark:text-zinc-400">
              {"{product_price}"}
            </code>
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[#25D366] dark:text-zinc-400">
              {"{product_url}"}
            </code>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80 mb-1">
            Product Button Label
          </label>
          <input
            type="text"
            value={settings.buttonText}
            onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-6 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
        >
          {saving ? "Saving Settings..." : "Save WhatsApp Settings"}
        </button>
      </div>
    </form>
  );
}
