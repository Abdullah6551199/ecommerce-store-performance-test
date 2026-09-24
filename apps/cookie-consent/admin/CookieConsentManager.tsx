"use client";

import React, { useState, useEffect } from "react";
import Toggle from "@/components/ui/Toggle";
import { getDefaultCookiePolicyContent } from "../lib/cookie-consent";
import type {
  CookieConsentAppSettings,
  CookieConsentSettingItem,
  CookieConsentStats,
} from "../shared/types";
import { DEFAULT_COOKIE_CONSENT_SETTINGS } from "../shared/types";

export default function CookieConsentManager(): React.JSX.Element {
  const [appSettings, setAppSettings] = useState<CookieConsentAppSettings>(
    DEFAULT_COOKIE_CONSENT_SETTINGS
  );
  const [content, setContent] = useState<Partial<CookieConsentSettingItem>>({});
  const [stats, setStats] = useState<CookieConsentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"banner" | "categories" | "stats" | "preview">("banner");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, contentRes, statsRes] = await Promise.all([
        fetch("/api/admin/apps/cookie-consent/settings").then((r) => r.json() as Promise<any>),
        fetch("/api/admin/cookie-settings").then((r) => r.json() as Promise<any>),
        fetch("/api/admin/cookie-consent/stats").then((r) => r.json() as Promise<any>),
      ]);

      if (appRes.success && appRes.data) {
        setAppSettings({ ...DEFAULT_COOKIE_CONSENT_SETTINGS, ...appRes.data });
      }
      if (contentRes.success && contentRes.data) {
        setContent(contentRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (_err) {
      setMessage({ type: "error", text: "Failed to load cookie consent settings" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const [appSaveRes, contentSaveRes] = await Promise.all([
        fetch("/api/admin/apps/cookie-consent/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appSettings),
        }),
        fetch("/api/admin/cookie-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isEnabled: appSettings.enabled,
            bannerTitle: content.bannerTitle,
            bannerMessage: content.bannerMessage,
            acceptText: content.acceptText,
            rejectText: content.rejectText,
            customizeText: content.customizeText,
            position: appSettings.bannerPosition,
            theme: appSettings.theme,
            analyticsEnabled: appSettings.analyticsCategory,
            marketingEnabled: appSettings.marketingCategory,
            functionalEnabled: appSettings.functionalCategory,
            cookiePolicyContent: content.cookiePolicyContent || getDefaultCookiePolicyContent(),
          }),
        }),
      ]);

      const appJson = (await appSaveRes.json()) as any;
      const contentJson = (await contentSaveRes.json()) as any;

      if (appJson.success && contentJson.success) {
        setMessage({ type: "success", text: "Cookie consent settings saved successfully" });
      } else {
        setMessage({
          type: "error",
          text: appJson.error || contentJson.error || "Failed to save settings",
        });
      }
    } catch (_err) {
      setMessage({ type: "error", text: "Error saving cookie consent settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#25D366] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-[#25D366]">🍪</span> Cookie Consent & GDPR Compliance
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage cookie consent banner, privacy policy, and script blocking rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#25D366] px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#1EA855] transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("banner")}
          className={`px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "banner"
              ? "border-[#25D366] text-[#25D366]"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Banner & Behavior
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "categories"
              ? "border-[#25D366] text-[#25D366]"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Cookie Categories
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "stats"
              ? "border-[#25D366] text-[#25D366]"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Compliance Stats
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "preview"
              ? "border-[#25D366] text-[#25D366]"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Live Preview
        </button>
      </div>

      {/* TAB 1: Banner & Behavior */}
      {activeTab === "banner" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Master Switches</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <Toggle
                  checked={appSettings.enabled}
                  onChange={(val) => setAppSettings({ ...appSettings, enabled: val })}
                />
                <span className="text-sm font-semibold">Enable Cookie Consent Banner</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Toggle
                  checked={appSettings.blockScriptsUntilConsent}
                  onChange={(val) =>
                    setAppSettings({ ...appSettings, blockScriptsUntilConsent: val })
                  }
                />
                <span className="text-sm font-semibold">Block Scripts Until Consent</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Banner Content</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={content.bannerTitle || ""}
                  onChange={(e) => setContent({ ...content, bannerTitle: e.target.value })}
                  placeholder="We use cookies"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Accept Button Text
                </label>
                <input
                  type="text"
                  value={content.acceptText || ""}
                  onChange={(e) => setContent({ ...content, acceptText: e.target.value })}
                  placeholder="Accept All"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Reject Button Text
                </label>
                <input
                  type="text"
                  value={content.rejectText || ""}
                  onChange={(e) => setContent({ ...content, rejectText: e.target.value })}
                  placeholder="Reject All"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Customize Button Text
                </label>
                <input
                  type="text"
                  value={content.customizeText || ""}
                  onChange={(e) => setContent({ ...content, customizeText: e.target.value })}
                  placeholder="Customize"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Banner Message
              </label>
              <textarea
                rows={2}
                value={content.bannerMessage || ""}
                onChange={(e) => setContent({ ...content, bannerMessage: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Position & Expiry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Position
                </label>
                <select
                  value={appSettings.bannerPosition}
                  onChange={(e) =>
                    setAppSettings({
                      ...appSettings,
                      bannerPosition: e.target.value as "bottom" | "top",
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="bottom">Bottom of Screen (Standard)</option>
                  <option value="top">Top of Screen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Theme
                </label>
                <select
                  value={appSettings.theme}
                  onChange={(e) =>
                    setAppSettings({
                      ...appSettings,
                      theme: e.target.value as "light" | "dark" | "auto",
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="auto">Auto (Match Storefront Theme)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Consent Expiry (Days)
                </label>
                <input
                  type="number"
                  min={30}
                  max={730}
                  value={appSettings.consentExpiryDays}
                  onChange={(e) =>
                    setAppSettings({
                      ...appSettings,
                      consentExpiryDays: Number(e.target.value) || 365,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Categories */}
      {activeTab === "categories" && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
          <h3 className="font-bold text-gray-900 dark:text-white">Active Consent Categories</h3>
          <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-sm block">Strictly Necessary</span>
                <span className="text-xs text-gray-500">
                  Cart session, CSRF safety, and customer authentication.
                </span>
              </div>
              <span className="rounded-full bg-[#DCFCE7] dark:bg-[#18181B]/50 px-2.5 py-1 text-[10px] font-bold text-[#25D366]">
                Always Active
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-sm block">Analytics Cookies</span>
                <span className="text-xs text-gray-500">
                  Google Analytics, page tracking, speed diagnostics.
                </span>
              </div>
              <Toggle
                checked={appSettings.analyticsCategory}
                onChange={(val) => setAppSettings({ ...appSettings, analyticsCategory: val })}
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-sm block">Marketing Pixels</span>
                <span className="text-xs text-gray-500">
                  Meta Pixel, TikTok Pixel, remarketing tags.
                </span>
              </div>
              <Toggle
                checked={appSettings.marketingCategory}
                onChange={(val) => setAppSettings({ ...appSettings, marketingCategory: val })}
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-sm block">Functional Preferences</span>
                <span className="text-xs text-gray-500">
                  Currency selector, wishlist, and theme mode.
                </span>
              </div>
              <Toggle
                checked={appSettings.functionalCategory}
                onChange={(val) => setAppSettings({ ...appSettings, functionalCategory: val })}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Compliance Stats */}
      {activeTab === "stats" && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
          <h3 className="font-bold text-gray-900 dark:text-white">Consent Telemetry Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800/40 p-4 bg-[#F4F4F5]/30 dark:bg-[#18181B]/20">
              <span className="text-xs text-gray-500 block">Total Consents</span>
              <span className="text-2xl font-black text-[#25D366]">
                {stats?.totalLogged ?? 0}
              </span>
            </div>
            <div className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800/40 p-4 bg-[#F4F4F5]/30 dark:bg-[#18181B]/20">
              <span className="text-xs text-gray-500 block">Analytics Accepted</span>
              <span className="text-2xl font-black text-emerald-600">
                {stats?.analyticsAccepted ?? 0}
              </span>
            </div>
            <div className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800/40 p-4 bg-[#F4F4F5]/30 dark:bg-[#18181B]/20">
              <span className="text-xs text-gray-500 block">Marketing Accepted</span>
              <span className="text-2xl font-black text-indigo-600">
                {stats?.marketingAccepted ?? 0}
              </span>
            </div>
            <div className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800/40 p-4 bg-[#F4F4F5]/30 dark:bg-[#18181B]/20">
              <span className="text-xs text-gray-500 block">Functional Accepted</span>
              <span className="text-2xl font-black text-[#25D366]">
                {stats?.functionalAccepted ?? 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Live Preview */}
      {activeTab === "preview" && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Banner Mockup Preview</h3>
          <div className="rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/40 p-6 bg-[#F4F4F5]/20 dark:bg-[#18181B]/20">
            <div className="rounded-2xl border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#1a052e] p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span>🍪</span>
                  <h4 className="font-bold text-sm text-[#18181B] dark:text-white">
                    {content.bannerTitle || "We use cookies"}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {content.bannerMessage || "We use cookies to improve your experience."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800 px-3 py-1.5 text-xs font-bold text-[#15803D] dark:text-[#DCFCE7]"
                >
                  {content.customizeText || "Customize"}
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800 px-3 py-1.5 text-xs font-bold text-[#15803D] dark:text-[#DCFCE7]"
                >
                  {content.rejectText || "Reject All"}
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-[#25D366] px-4 py-1.5 text-xs font-bold text-white shadow-sm"
                >
                  {content.acceptText || "Accept All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
