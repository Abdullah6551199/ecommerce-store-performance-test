"use client";

import React, { useState, useEffect } from "react";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings";

export default function SettingsManager(): React.JSX.Element {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "social" | "header_footer">("general");

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings");
      const json = (await res.json()) as any;
      if (json.success) {
        setSettings(json.data);
      } else {
        setError(json.error || "Failed to load store settings.");
      }
    } catch (err) {
      setError("Network error loading store settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as any;
      if (json.success && json.data?.url) {
        setSettings((prev) => ({
          ...prev,
          logoUrl: json.data.url,
        }));
        setSuccessMessage("Logo uploaded to Cloudflare R2.");
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        alert(json.error || "Logo upload failed.");
      }
    } catch (err) {
      alert("Error uploading logo to R2.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setSuccessMessage("Store settings saved to Cloudflare D1 successfully.");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(json.error || "Failed to save settings.");
      }
    } catch (err) {
      setError("Network error saving store settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-12 text-center text-xs text-zinc-500 dark:text-white/50 animate-pulse">
        Loading store settings from Cloudflare D1...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMessage && (
        <div className="rounded-xl border border-[#18C729]/40 bg-[#18C729]/10 p-4 text-xs font-medium text-[#18C729] flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-white/10 gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === "general"
              ? "border-b-2 border-[#18C729] text-[#18C729] bg-zinc-100 dark:bg-white/5"
              : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          General Branding
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === "contact"
              ? "border-b-2 border-[#18C729] text-[#18C729] bg-zinc-100 dark:bg-white/5"
              : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          Contact Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === "social"
              ? "border-b-2 border-[#18C729] text-[#18C729] bg-zinc-100 dark:bg-white/5"
              : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          Social Media Links
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("header_footer")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === "header_footer"
              ? "border-b-2 border-[#18C729] text-[#18C729] bg-zinc-100 dark:bg-white/5"
              : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          Header & Footer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: General Branding */}
        {activeTab === "general" && (
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Brand & Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Store Name</label>
                <input
                  type="text"
                  required
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Logo Text / Monogram</label>
                <input
                  type="text"
                  value={settings.logoText}
                  onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Store Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Meta Description</label>
              <textarea
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
              />
            </div>

            {/* Logo Upload Section */}
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-white">Custom Brand Logo (R2)</label>
                <label className="cursor-pointer rounded-lg bg-[#18C729]/20 px-2.5 py-1 text-[11px] font-semibold text-[#18C729] hover:bg-[#18C729]/30 transition-colors">
                  {uploadingLogo ? "Uploading..." : "Upload Logo to R2"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="text"
                placeholder="https://... image URL"
                value={settings.logoUrl || ""}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
              />
              {settings.logoUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={settings.logoUrl}
                    alt="Logo preview"
                    className="h-10 w-auto max-w-xs rounded border border-zinc-300 dark:border-white/20 p-1 bg-zinc-100 dark:bg-black/30"
                  />
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, logoUrl: "" })}
                    className="text-xs text-red-500 dark:text-red-400 hover:underline"
                  >
                    Clear logo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Contact Information */}
        {activeTab === "contact" && (
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Customer Support & Locations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Support Email</label>
                <input
                  type="email"
                  required
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Support Phone</label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Physical Address / Headquarters</label>
              <input
                type="text"
                value={settings.contactAddress}
                onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Social Media Links */}
        {activeTab === "social" && (
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Social Media Channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Twitter / X URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.twitter || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Instagram URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.instagram || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Facebook URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.facebook || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">GitHub URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.github || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, github: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">YouTube URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.youtube || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, youtube: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Header & Footer */}
        {activeTab === "header_footer" && (
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Header & Footer Experience</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showAnnouncement"
                  checked={settings.showAnnouncement}
                  onChange={(e) => setSettings({ ...settings, showAnnouncement: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-white/20 bg-white dark:bg-white/5 text-[#18C729] focus:ring-[#18C729]"
                />
                <label htmlFor="showAnnouncement" className="text-xs text-zinc-800 dark:text-white font-medium">
                  Display Top Announcement Banner
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Announcement Message</label>
                  <input
                    type="text"
                    value={settings.announcementText}
                    onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Announcement Target Link</label>
                  <input
                    type="text"
                    value={settings.announcementUrl}
                    onChange={(e) => setSettings({ ...settings, announcementUrl: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Copyright Footer Text</label>
                <input
                  type="text"
                  value={settings.copyrightText}
                  onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-6 py-2.5 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
          >
            {saving ? "Saving Settings..." : "Save Settings to Database"}
          </button>
        </div>
      </form>
    </div>
  );
}
