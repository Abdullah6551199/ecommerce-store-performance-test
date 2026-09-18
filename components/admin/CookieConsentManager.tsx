"use client";

import React, { useState, useEffect } from "react";
import { getDefaultCookiePolicyContent } from "@/lib/cookie-consent";
import type { CookieConsentSettingRecord } from "@/lib/db";
import { fetchWithClientCache, invalidateClientCache } from "@/lib/client-cache";
import Toggle from "@/components/ui/Toggle";

export default function CookieConsentManager(): React.JSX.Element {
  const [settings, setSettings] = useState<CookieConsentSettingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"banner" | "categories" | "policy" | "preview">("banner");

  const [form, setForm] = useState({
    isEnabled: true,
    bannerTitle: "We use cookies",
    bannerMessage: "We use cookies to improve your experience, analyze traffic, and personalize content.",
    acceptText: "Accept All",
    rejectText: "Reject All",
    customizeText: "Customize",
    position: "bottom",
    theme: "light",
    analyticsEnabled: true,
    marketingEnabled: true,
    functionalEnabled: true,
    cookiePolicyContent: "",
  });

  const fetchSettings = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const json = await fetchWithClientCache<CookieConsentSettingRecord>(
        "/api/admin/cookie-settings",
        { forceRefresh }
      );
      if (json.success && json.data) {
        setSettings(json.data);
        setForm({
          isEnabled: json.data.isEnabled ?? true,
          bannerTitle: json.data.bannerTitle || "We use cookies",
          bannerMessage: json.data.bannerMessage || "",
          acceptText: json.data.acceptText || "Accept All",
          rejectText: json.data.rejectText || "Reject All",
          customizeText: json.data.customizeText || "Customize",
          position: json.data.position || "bottom",
          theme: json.data.theme || "light",
          analyticsEnabled: json.data.analyticsEnabled ?? true,
          marketingEnabled: json.data.marketingEnabled ?? true,
          functionalEnabled: json.data.functionalEnabled ?? true,
          cookiePolicyContent: json.data.cookiePolicyContent || getDefaultCookiePolicyContent(),
        });
      }
    } catch (err) {
      console.warn("Failed to load cookie settings:", err);
      setMessage({ type: "error", text: "Failed to load cookie settings" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/cookie-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setSettings(json.data);
        invalidateClientCache("/api/admin/cookie-settings");
        invalidateClientCache("/api/cookie-settings");
        setMessage({ type: "success", text: "Cookie consent settings updated successfully" });
      } else {
        setMessage({ type: "error", text: json.error || "Failed to update settings" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred while saving settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPolicy = () => {
    if (confirm("Reset Cookie Policy content to standard GDPR default template?")) {
      setForm((prev) => ({ ...prev, cookiePolicyContent: getDefaultCookiePolicyContent() }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-5xl">
        <div className="h-8 w-64 bg-purple-100 dark:bg-purple-900/40 rounded-lg" />
        <div className="h-96 bg-purple-50 dark:bg-purple-950/20 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#3C0561] dark:text-white">
            Cookie Consent &amp; GDPR Compliance
          </h1>
          <p className="text-xs text-[#5A0891]/80 dark:text-[#EACFFC]/70 mt-1">
            Configure the customer cookie banner, granular categories, and legal policy under ePrivacy &amp; GDPR.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("banner")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "banner"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-[#3C0561] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-900/40"
            }`}
          >
            Banner Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-[#3C0561] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-900/40"
            }`}
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("policy")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "policy"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-[#3C0561] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-900/40"
            }`}
          >
            Cookie Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-[#3C0561] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-900/40"
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            message.type === "success"
              ? "bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800"
              : "bg-red-100 text-red-900 border border-red-300 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Banner Configuration */}
        {activeTab === "banner" && (
          <div className="rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-[#3C0561]/20 p-6 space-y-6 shadow-sm">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800/60 pb-5">
              <div>
                <h3 className="text-sm font-bold text-[#3C0561] dark:text-white">
                  Enable Cookie Consent Banner
                </h3>
                <p className="text-xs text-zinc-500 dark:text-white/60">
                  When enabled, visiting shoppers are prompted to accept or reject tracking cookies.
                </p>
              </div>
              <Toggle
                size="md"
                checked={form.isEnabled}
                onChange={(val) => setForm({ ...form, isEnabled: val })}
                aria-label="Enable Cookie Consent Banner"
              />
            </div>

            {/* Banner Title & Message */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={form.bannerTitle}
                  onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Banner Message
                </label>
                <textarea
                  rows={3}
                  value={form.bannerMessage}
                  onChange={(e) => setForm({ ...form, bannerMessage: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                />
              </div>
            </div>

            {/* Buttons Customization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Accept Button Text
                </label>
                <input
                  type="text"
                  value={form.acceptText}
                  onChange={(e) => setForm({ ...form, acceptText: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Reject Button Text
                </label>
                <input
                  type="text"
                  value={form.rejectText}
                  onChange={(e) => setForm({ ...form, rejectText: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Customize Button Text
                </label>
                <input
                  type="text"
                  value={form.customizeText}
                  onChange={(e) => setForm({ ...form, customizeText: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                />
              </div>
            </div>

            {/* Position & Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Position
                </label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                >
                  <option value="bottom">Fixed Bottom (Recommended)</option>
                  <option value="top">Fixed Top</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Theme Appearance
                </label>
                <select
                  value={form.theme}
                  onChange={(e) => setForm({ ...form, theme: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                >
                  <option value="light">Light (White background with Purple accents)</option>
                  <option value="dark">Dark (Deep Purple background)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Cookie Categories */}
        {activeTab === "categories" && (
          <div className="rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-[#3C0561]/20 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3C0561] dark:text-white mb-2">
              Consent Categories Control
            </h3>

            {/* Necessary */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-purple-100 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30">
              <div>
                <span className="text-xs font-bold text-[#3C0561] dark:text-white block">
                  Necessary Cookies (Session, Cart, Auth)
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-white/60">
                  Always mandatory under GDPR. Cannot be disabled.
                </span>
              </div>
              <span className="rounded-full bg-purple-100 dark:bg-purple-800 px-2.5 py-1 text-[10px] font-black text-[#960DF2] dark:text-[#EACFFC]">
                ALWAYS ON
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-purple-950/10">
              <div>
                <span className="text-xs font-bold text-[#3C0561] dark:text-white block">
                  Analytics Cookies (Google Analytics, Hotjar)
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-white/60">
                  Allow customers to toggle telemetry and traffic tracking consent.
                </span>
              </div>
              <Toggle
                size="md"
                checked={form.analyticsEnabled}
                onChange={(val) => setForm({ ...form, analyticsEnabled: val })}
                aria-label="Toggle Analytics Cookies"
              />
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-purple-950/10">
              <div>
                <span className="text-xs font-bold text-[#3C0561] dark:text-white block">
                  Marketing Cookies (Meta Pixel, TikTok Pixel)
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-white/60">
                  Allow customers to toggle conversion ads and retargeting tracking.
                </span>
              </div>
              <Toggle
                size="md"
                checked={form.marketingEnabled}
                onChange={(val) => setForm({ ...form, marketingEnabled: val })}
                aria-label="Toggle Marketing Cookies"
              />
            </div>

            {/* Functional */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-purple-950/10">
              <div>
                <span className="text-xs font-bold text-[#3C0561] dark:text-white block">
                  Functional Cookies (Theme Mode, Compare Trays)
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-white/60">
                  Allow customers to toggle client preference cookies.
                </span>
              </div>
              <Toggle
                size="md"
                checked={form.functionalEnabled}
                onChange={(val) => setForm({ ...form, functionalEnabled: val })}
                aria-label="Toggle Functional Cookies"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Cookie Policy Content */}
        {activeTab === "policy" && (
          <div className="rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-[#3C0561]/20 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#3C0561] dark:text-white">
                  Cookie Policy Page Content
                </h3>
                <p className="text-xs text-zinc-500 dark:text-white/60">
                  Rendered dynamically at <span className="font-mono text-purple-600 dark:text-purple-400">/cookie-policy</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetPolicy}
                className="px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-xs font-bold text-[#960DF2] dark:text-[#EACFFC] cursor-pointer"
              >
                Reset to Default Template
              </button>
            </div>

            <textarea
              rows={16}
              value={form.cookiePolicyContent}
              onChange={(e) => setForm({ ...form, cookiePolicyContent: e.target.value })}
              className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-4 text-xs text-[#3C0561] dark:text-white font-mono leading-relaxed"
            />
          </div>
        )}

        {/* TAB 4: Live Banner Preview */}
        {activeTab === "preview" && (
          <div className="rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800 p-6 bg-white dark:bg-[#3C0561]/20 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                Live Storefront Banner Preview
              </h3>
              <p className="text-xs text-zinc-500 dark:text-white/60">
                Position: <span className="font-bold capitalize">{form.position}</span> • Theme:{" "}
                <span className="font-bold capitalize">{form.theme}</span>
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
                form.theme === "dark"
                  ? "border-purple-800 bg-[#2D024A] text-white shadow-purple-950/50"
                  : "border-purple-200 bg-white dark:bg-[#3C0561] text-[#3C0561] dark:text-white shadow-purple-900/15"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍪</span>
                    <h4 className="text-base font-extrabold tracking-tight">{form.bannerTitle}</h4>
                  </div>
                  <p className="text-xs text-[#5A0891]/80 dark:text-[#EACFFC]/80 leading-relaxed">
                    {form.bannerMessage}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-[#960DF2] dark:text-[#EACFFC]">
                    <span className="underline">Read our Cookie Policy</span>
                    <span>•</span>
                    <span className="underline">Privacy Policy</span>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-[#960DF2] text-white text-xs font-bold shadow-md shadow-purple-500/20"
                  >
                    {form.acceptText}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/30 text-xs font-bold text-[#3C0561] dark:text-[#EACFFC]"
                  >
                    {form.rejectText}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl border border-dashed border-purple-300 dark:border-purple-600 text-xs font-bold text-[#960DF2] dark:text-[#EACFFC]"
                  >
                    {form.customizeText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#960DF2] hover:bg-[#AB3DF5] text-white text-xs font-extrabold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving Settings..." : "Save Cookie Consent Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
