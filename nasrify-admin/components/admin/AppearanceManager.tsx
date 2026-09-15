"use client";

import React, { useState, useEffect } from "react";
import {
  ThemeSettings,
  DEFAULT_THEME_SETTINGS,
  THEME_PRESETS,
  ThemePreset,
} from "@/lib/theme";

export default function AppearanceManager(): React.JSX.Element {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "design" | "branding">("colors");

  // Load theme settings from API
  const fetchTheme = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/appearance");
      const json = (await res.json()) as any;
      if (json.success && json.data) {
        setTheme(json.data);
      } else {
        setError(json.error || "Failed to load appearance settings.");
      }
    } catch (err) {
      setError("Network error loading appearance settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Save changes to Cloudflare D1
  const handleSaveTheme = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        showNotification("Theme and appearance settings saved to Cloudflare D1!");
      } else {
        alert(json.error || "Failed to update theme settings.");
      }
    } catch (err) {
      alert("Error saving appearance settings.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default brand settings
  const handleResetDefaults = async () => {
    if (!confirm("Are you sure you want to reset all appearance and theme settings to Apex brand defaults?")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setTheme(json.data || DEFAULT_THEME_SETTINGS);
        showNotification("Theme settings reset to default brand configuration.");
      } else {
        alert(json.error || "Failed to reset theme.");
      }
    } catch (err) {
      alert("Error resetting theme.");
    } finally {
      setSaving(false);
    }
  };

  // Apply a preset
  const handleApplyPreset = (preset: ThemePreset) => {
    setTheme(preset.settings);
    showNotification(`Applied "${preset.name}" preset! Click "Save Theme" to persist.`);
  };

  // Upload logo or favicon to Cloudflare R2
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "logo") setUploadingLogo(true);
    else setUploadingFavicon(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as any;
      if (json.success && json.data?.url) {
        if (type === "logo") {
          setTheme({
            ...theme,
            other: { ...theme.other, storeLogo: json.data.url },
          });
          showNotification("Store logo uploaded to Cloudflare R2 successfully.");
        } else {
          setTheme({
            ...theme,
            other: { ...theme.other, favicon: json.data.url },
          });
          showNotification("Favicon uploaded to Cloudflare R2 successfully.");
        }
      } else {
        alert(json.error || "Upload failed.");
      }
    } catch (err) {
      alert("Error uploading asset to R2.");
    } finally {
      if (type === "logo") setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-12 text-center text-xs text-zinc-500 dark:text-white/50 animate-pulse">
        Loading store appearance settings from Cloudflare D1...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Appearance & Theme System</h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-white/60">
            Customize colors, typography, borders, and brand accents with dynamic storefront propagation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-white/80 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all"
          >
            Reset to Brand Defaults
          </button>
          <button
            type="button"
            onClick={() => handleSaveTheme()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? (
              <span>Saving to D1...</span>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Theme Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="rounded-xl border border-[#18C729]/40 bg-[#18C729]/10 p-3 text-xs font-medium text-[#18C729] flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={fetchTheme} className="underline hover:text-red-700 dark:hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* Presets Strip */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-[#FEF500]">
            Curated Theme Presets
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-white/50">Click to preview palette & typography</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 hover:border-[#18C729]/50 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{preset.name}</h4>
                  <div className="flex gap-1">
                    <span
                      className="h-3 w-3 rounded-full border border-black/40"
                      style={{ backgroundColor: preset.settings.colors.primary }}
                    />
                    <span
                      className="h-3 w-3 rounded-full border border-black/40"
                      style={{ backgroundColor: preset.settings.colors.accent }}
                    />
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-white/50 line-clamp-2">{preset.description}</p>
              </div>
              <div className="mt-3 text-[10px] font-semibold text-[#18C729]">Apply Preset &rarr;</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Controls Left (7 cols), Live Preview Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Settings Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs Navigation */}
          <div className="flex rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-[#0c140f] p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("colors")}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                activeTab === "colors"
                  ? "bg-[#18C729] text-black shadow-md"
                  : "text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Colors & Palette
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("typography")}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                activeTab === "typography"
                  ? "bg-[#18C729] text-black shadow-md"
                  : "text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Typography
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("design")}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                activeTab === "design"
                  ? "bg-[#18C729] text-black shadow-md"
                  : "text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Design & Radii
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("branding")}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                activeTab === "branding"
                  ? "bg-[#18C729] text-black shadow-md"
                  : "text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Branding Assets
            </button>
          </div>

          {/* Tab 1: Colors */}
          {activeTab === "colors" && (
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Color Palette Tokens</span>
                <span className="text-[10px] font-mono text-[#18C729] bg-[#18C729]/10 px-2 py-0.5 rounded">
                  9 Tokens
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white flex items-center justify-between">
                    <span>Primary Color</span>
                    <span className="font-mono text-[10px] text-zinc-500 dark:text-white/50">{theme.colors.primary}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.primary}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, primary: e.target.value } })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-300 dark:border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={theme.colors.primary}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, primary: e.target.value } })
                      }
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-2.5 py-1.5 font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Secondary */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white flex items-center justify-between">
                    <span>Secondary Color</span>
                    <span className="font-mono text-[10px] text-zinc-500 dark:text-white/50">{theme.colors.secondary}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.secondary}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, secondary: e.target.value } })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-300 dark:border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={theme.colors.secondary}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, secondary: e.target.value } })
                      }
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-2.5 py-1.5 font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Accent */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white flex items-center justify-between">
                    <span>Accent / Highlight</span>
                    <span className="font-mono text-[10px] text-zinc-500 dark:text-white/50">{theme.colors.accent}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.accent}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, accent: e.target.value } })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-300 dark:border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={theme.colors.accent}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, accent: e.target.value } })
                      }
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-2.5 py-1.5 font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Background */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white flex items-center justify-between">
                    <span>Background Base</span>
                    <span className="font-mono text-[10px] text-zinc-500 dark:text-white/50">{theme.colors.background}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.background}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, background: e.target.value } })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-300 dark:border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={theme.colors.background}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, background: e.target.value } })
                      }
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-2.5 py-1.5 font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white flex items-center justify-between">
                    <span>Text Primary</span>
                    <span className="font-mono text-[10px] text-zinc-500 dark:text-white/50">{theme.colors.text}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.text}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, text: e.target.value } })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-300 dark:border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={theme.colors.text}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, text: e.target.value } })
                      }
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-2.5 py-1.5 font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Muted Text */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white flex items-center justify-between">
                    <span>Muted Text</span>
                    <span className="font-mono text-[10px] text-zinc-500 dark:text-white/50">{theme.colors.mutedText}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.mutedText}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, mutedText: e.target.value } })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-300 dark:border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={theme.colors.mutedText}
                      onChange={(e) =>
                        setTheme({ ...theme, colors: { ...theme.colors, mutedText: e.target.value } })
                      }
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-2.5 py-1.5 font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Border */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white flex items-center justify-between">
                    <span>Border Outline</span>
                    <span className="font-mono text-[10px] text-zinc-500 dark:text-white/50">{theme.colors.border}</span>
                  </label>
                  <input
                    type="text"
                    value={theme.colors.border}
                    onChange={(e) =>
                      setTheme({ ...theme, colors: { ...theme.colors, border: e.target.value } })
                    }
                    className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-2.5 py-1.5 font-mono text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Success & Error */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white flex items-center justify-between">
                    <span>Status Signals</span>
                    <span className="text-[10px] text-zinc-500 dark:text-white/50">Success / Error</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={theme.colors.success}
                        onChange={(e) =>
                          setTheme({ ...theme, colors: { ...theme.colors, success: e.target.value } })
                        }
                        className="h-7 w-8 cursor-pointer rounded border border-zinc-300 dark:border-white/20 bg-transparent"
                      />
                      <span className="font-mono text-[10px] text-zinc-700 dark:text-white/70">{theme.colors.success}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={theme.colors.error}
                        onChange={(e) =>
                          setTheme({ ...theme, colors: { ...theme.colors, error: e.target.value } })
                        }
                        className="h-7 w-8 cursor-pointer rounded border border-zinc-300 dark:border-white/20 bg-transparent"
                      />
                      <span className="font-mono text-[10px] text-zinc-700 dark:text-white/70">{theme.colors.error}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Typography */}
          {activeTab === "typography" && (
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Typography Families</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Headings Font</label>
                  <select
                    value={theme.typography.headingFont}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        typography: { ...theme.typography, headingFont: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                  >
                    <option value="Inter, system-ui, sans-serif">Inter (Modern & Clean)</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Sleek Geometric)</option>
                    <option value="Outfit, sans-serif">Outfit (Bold Athletic Display)</option>
                    <option value="Roboto, sans-serif">Roboto (Technical Balanced)</option>
                    <option value="system-ui, -apple-system, sans-serif">System UI (Native Edge)</option>
                  </select>
                  <p
                    className="mt-2 p-3 rounded-lg bg-zinc-100 dark:bg-white/5 text-base font-extrabold text-zinc-900 dark:text-white"
                    style={{ fontFamily: theme.typography.headingFont }}
                  >
                    Engineered for Peak Athletic Velocity 0123456789
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Body Font</label>
                  <select
                    value={theme.typography.bodyFont}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        typography: { ...theme.typography, bodyFont: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                  >
                    <option value="Inter, system-ui, sans-serif">Inter (High Legibility)</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                    <option value="system-ui, -apple-system, sans-serif">System Native</option>
                  </select>
                  <p
                    className="mt-2 p-3 rounded-lg bg-zinc-100 dark:bg-white/5 text-xs text-zinc-600 dark:text-white/70 leading-relaxed"
                    style={{ fontFamily: theme.typography.bodyFont }}
                  >
                    Next-generation sports equipment and technical apparel engineered for peak human performance with zero edge latency.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Button Font</label>
                  <select
                    value={theme.typography.buttonFont}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        typography: { ...theme.typography, buttonFont: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                  >
                    <option value="Inter, system-ui, sans-serif">Inter</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                    <option value="Outfit, sans-serif">Outfit (Punchy)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Design & Radii */}
          {activeTab === "design" && (
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 space-y-5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Layout, Radii & Shadows</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-white/70">
                    <label>Container Max Width</label>
                    <span className="font-mono text-[#18C729]">{theme.design.containerWidth}</span>
                  </div>
                  <select
                    value={theme.design.containerWidth}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        design: { ...theme.design, containerWidth: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-xs text-zinc-900 dark:text-white"
                  >
                    <option value="1200px">1200px (Compact)</option>
                    <option value="1280px">1280px (Standard / Max-7XL)</option>
                    <option value="1440px">1440px (Wide High-Def)</option>
                    <option value="1600px">1600px (Ultra-Wide Showcase)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Button Radius</label>
                    <input
                      type="text"
                      value={theme.design.buttonRadius}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          design: { ...theme.design, buttonRadius: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 font-mono text-xs text-zinc-900 dark:text-white"
                      placeholder="12px or 9999px"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Card Radius</label>
                    <input
                      type="text"
                      value={theme.design.cardRadius}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          design: { ...theme.design, cardRadius: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 font-mono text-xs text-zinc-900 dark:text-white"
                      placeholder="24px"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Base Border Radius</label>
                    <input
                      type="text"
                      value={theme.design.borderRadius}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          design: { ...theme.design, borderRadius: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 font-mono text-xs text-zinc-900 dark:text-white"
                      placeholder="12px"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Shadow Intensity</label>
                    <select
                      value={theme.design.shadows}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          design: { ...theme.design, shadows: e.target.value as any },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-xs text-zinc-900 dark:text-white"
                    >
                      <option value="none">None (Flat Minimalist)</option>
                      <option value="soft">Soft Ambient</option>
                      <option value="medium">Medium Elevating</option>
                      <option value="intense">Intense Edge Glow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Spacing Density</label>
                    <select
                      value={theme.design.spacing}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          design: { ...theme.design, spacing: e.target.value as any },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-xs text-zinc-900 dark:text-white"
                    >
                      <option value="compact">Compact (High density)</option>
                      <option value="normal">Normal (Standard)</option>
                      <option value="spacious">Spacious (Editorial)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Branding Assets */}
          {activeTab === "branding" && (
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Store Branding & Announcements</h3>

              {/* Logo Upload */}
              <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white">Store Logo</label>
                  <label className="cursor-pointer rounded-lg bg-[#18C729]/20 px-2.5 py-1 text-[11px] font-semibold text-[#18C729] hover:bg-[#18C729]/30 transition-colors">
                    {uploadingLogo ? "Uploading to R2..." : "Upload Logo to R2"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "logo")}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="https://... or upload to Cloudflare R2"
                  value={theme.other.storeLogo || ""}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      other: { ...theme.other, storeLogo: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
                {theme.other.storeLogo && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={theme.other.storeLogo}
                      alt="Logo preview"
                      className="h-10 max-w-[120px] object-contain rounded border border-zinc-300 dark:border-white/20 p-1 bg-zinc-100 dark:bg-black/50"
                    />
                    <button
                      type="button"
                      onClick={() => setTheme({ ...theme, other: { ...theme.other, storeLogo: "" } })}
                      className="text-xs text-red-500 dark:text-red-400 hover:underline"
                    >
                      Clear logo
                    </button>
                  </div>
                )}
              </div>

              {/* Favicon Upload */}
              <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-white">Favicon (.ico or .png)</label>
                  <label className="cursor-pointer rounded-lg bg-[#18C729]/20 px-2.5 py-1 text-[11px] font-semibold text-[#18C729] hover:bg-[#18C729]/30 transition-colors">
                    {uploadingFavicon ? "Uploading to R2..." : "Upload Favicon to R2"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "favicon")}
                      disabled={uploadingFavicon}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="https://... or upload to Cloudflare R2"
                  value={theme.other.favicon || ""}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      other: { ...theme.other, favicon: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>

              {/* Announcement Bar */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70">Top Announcement Bar Text</label>
                <input
                  type="text"
                  value={theme.other.announcementBarText || ""}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      other: { ...theme.other, announcementBarText: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Mockup Preview */}
        <div className="lg:col-span-5 space-y-3 sticky top-20">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-[#FEF500]">
              Interactive Live Storefront Mockup
            </h3>
            <span className="text-[10px] text-[#18C729] font-mono">Dynamic CSS Sync</span>
          </div>

          <div
            className="rounded-3xl border border-white/15 p-4 sm:p-5 shadow-2xl transition-all overflow-hidden space-y-4"
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              fontFamily: theme.typography.bodyFont,
              borderRadius: theme.design.cardRadius,
            }}
          >
            {/* 1. Announcement Bar Mockup */}
            {theme.other.announcementBarText && (
              <div
                className="px-3 py-1 text-center text-[10px] font-bold text-black rounded-lg transition-all"
                style={{
                  background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {theme.other.announcementBarText}
              </div>
            )}

            {/* 2. Header Bar Mockup */}
            <div
              className="flex items-center justify-between border-b pb-3"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center gap-2">
                {theme.other.storeLogo ? (
                  <img src={theme.other.storeLogo} alt="Logo" className="h-6 w-auto object-contain" />
                ) : (
                  <div
                    className="h-6 w-6 rounded flex items-center justify-center font-bold text-[10px] text-black"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    }}
                  >
                    AP
                  </div>
                )}
                <span className="text-xs font-extrabold" style={{ fontFamily: theme.typography.headingFont }}>
                  ApexStore
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="opacity-70">Catalog</span>
                <span className="opacity-70">Categories</span>
                <span
                  className="px-2 py-0.5 rounded text-black font-bold text-[9px]"
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.design.buttonRadius,
                  }}
                >
                  Cart (2)
                </span>
              </div>
            </div>

            {/* 3. Hero Showcase Card Mockup */}
            <div
              className="p-4 rounded-2xl border transition-all space-y-3"
              style={{
                borderColor: theme.colors.border,
                background: `radial-gradient(ellipse at top left, ${theme.colors.primary}22, transparent 70%), #0c140f`,
                borderRadius: theme.design.cardRadius,
              }}
            >
              <span
                className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-full"
                style={{
                  backgroundColor: `${theme.colors.accent}20`,
                  color: theme.colors.accent,
                }}
              >
                New Speed Series
              </span>

              <h4
                className="text-base font-extrabold leading-tight"
                style={{ fontFamily: theme.typography.headingFont, color: theme.colors.text }}
              >
                Peak Velocity Footwear
              </h4>

              <p className="text-[11px] leading-relaxed" style={{ color: theme.colors.mutedText }}>
                Engineered for maximum marathon responsiveness with carbon-plate technology.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-bold text-black shadow transition-transform active:scale-95"
                  style={{
                    backgroundColor: theme.colors.primary,
                    fontFamily: theme.typography.buttonFont,
                    borderRadius: theme.design.buttonRadius,
                  }}
                >
                  Shop Now
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium border"
                  style={{
                    borderColor: theme.colors.border,
                    fontFamily: theme.typography.buttonFont,
                    borderRadius: theme.design.buttonRadius,
                    color: theme.colors.text,
                  }}
                >
                  Explore
                </button>
              </div>
            </div>

            {/* 4. Product Card Component Mockup */}
            <div
              className="p-3 rounded-2xl border transition-all space-y-2.5"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: theme.design.cardRadius,
              }}
            >
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-40">Product Image</span>
                <span
                  className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded text-black"
                  style={{ backgroundColor: theme.colors.accent }}
                >
                  Featured
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h5 className="text-xs font-bold" style={{ fontFamily: theme.typography.headingFont }}>
                    Apex Runner X1
                  </h5>
                  <p className="text-[10px]" style={{ color: theme.colors.mutedText }}>
                    Men&apos;s Elite Sprint
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="text-xs font-extrabold block"
                    style={{ color: theme.colors.primary }}
                  >
                    $189.00
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2 text-xs font-bold text-black transition-all"
                style={{
                  background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  fontFamily: theme.typography.buttonFont,
                  borderRadius: theme.design.buttonRadius,
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
