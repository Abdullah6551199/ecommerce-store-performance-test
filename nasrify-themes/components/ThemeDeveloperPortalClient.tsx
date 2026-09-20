"use client";

import React, { useState } from "react";
import type { ThemeMarketplaceListing } from "@/types/themes";
import { ThemeMockupPreview } from "./ThemeMockupPreview";

interface ThemeDeveloperPortalProps {
  initialUser: { id: string; email: string; role: string } | null;
  initialThemes: ThemeMarketplaceListing[];
}

export function ThemeDeveloperPortalClient({
  initialUser,
  initialThemes,
}: ThemeDeveloperPortalProps): React.JSX.Element {
  const [user, setUser] = useState(initialUser);
  const [themes, setThemes] = useState<ThemeMarketplaceListing[]>(initialThemes);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [previewModalTheme, setPreviewModalTheme] = useState<ThemeMarketplaceListing | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Submit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [themeId, setThemeId] = useState("");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [authorUrl, setAuthorUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [category, setCategory] = useState("Minimal");
  const [pricing, setPricing] = useState<"free" | "paid">("free");
  const [price, setPrice] = useState("0");
  const [configJson, setConfigJson] = useState(
    JSON.stringify(
      {
        colors: {
          primary: "#780AC2",
          secondary: "#960DF2",
          accent: "#C06EF7",
          background: "#FAFAFA",
          surface: "#FFFFFF",
          text: "#18181B",
        },
        typography: {
          headingFont: "Inter, sans-serif",
          bodyFont: "Inter, sans-serif",
          scale: "1.2",
        },
        layout: {
          borderRadius: "12px",
          headerStyle: "minimal",
          productCardStyle: "elevated",
        },
        features: ["Edge SSR", "Dynamic Palettes", "Dark Mode Ready"],
      },
      null,
      2
    )
  );
  const [changelog, setChangelog] = useState("Initial release");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Handle Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/developer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data: any = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }
      setUser(data.user);

      // Refresh developer themes
      const myThemesRes = await fetch("/api/developer/my-themes");
      const myThemesData: any = await myThemesRes.json();
      if (myThemesData.success) {
        setThemes(myThemesData.themes);
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to sign in");
    } finally {
      setLoginLoading(false);
    }
  }

  // Handle Logout
  async function handleLogout() {
    try {
      await fetch("/api/developer/logout", { method: "POST" });
      setUser(null);
      setThemes([]);
    } catch {
      // Ignore
    }
  }

  // Handle Image Upload (Preview / Screenshot)
  async function handleUploadImage(file: File, isPreview: boolean) {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "themes");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data: any = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Image upload failed");
      }

      if (isPreview) {
        setPreviewUrl(data.data.url);
      } else {
        setScreenshotUrls((prev) => [...prev, data.data.url]);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  // Pre-fill form for editing
  function handleEditTheme(theme: ThemeMarketplaceListing) {
    setEditingId(theme.id);
    setThemeId(theme.themeId);
    setName(theme.name);
    setVersion(theme.version);
    setDescription(theme.description || "");
    setAuthor(theme.author || "");
    setAuthorUrl(theme.authorUrl || "");
    setPreviewUrl(theme.previewUrl || "");
    let screenshots: string[] = [];
    if (theme.screenshotUrls) {
      try {
        screenshots = JSON.parse(theme.screenshotUrls);
      } catch {
        screenshots = [];
      }
    }
    setScreenshotUrls(screenshots);
    setCategory(theme.category || "Minimal");
    setPricing(theme.pricing);
    setPrice(theme.price ? String(theme.price) : "0");
    setConfigJson(theme.configJson || "{}");
    setChangelog(theme.changelog || "");
    setActiveTab("create");
    setFormError("");
    setFormSuccess("");
  }

  // Handle Submit / Save Draft
  async function handleSubmit(submitForReview: boolean) {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");

    try {
      const payload = {
        id: editingId || undefined,
        themeId: themeId.trim().toLowerCase(),
        name: name.trim(),
        version: version.trim(),
        description: description.trim(),
        author: author.trim(),
        authorUrl: authorUrl.trim() || undefined,
        previewUrl: previewUrl.trim() || undefined,
        screenshotUrls: JSON.stringify(screenshotUrls),
        category: category.trim(),
        pricing,
        price: parseFloat(price) || 0,
        configJson,
        changelog: changelog.trim(),
        submitForReview,
      };

      const res = await fetch("/api/developer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: any = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }

      setFormSuccess(data.message || "Theme successfully saved!");

      // Refresh themes list
      const myThemesRes = await fetch("/api/developer/my-themes");
      const myThemesData: any = await myThemesRes.json();
      if (myThemesData.success) {
        setThemes(myThemesData.themes);
      }

      // Reset form if new theme
      if (!editingId) {
        setThemeId("");
        setName("");
        setDescription("");
        setAuthor("");
        setAuthorUrl("");
        setPreviewUrl("");
        setScreenshotUrls([]);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to process theme submission");
    } finally {
      setFormLoading(false);
    }
  }

  // Unauthenticated view: Login form
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#960DF2] to-[#C06EF7] flex items-center justify-center text-white text-xl mx-auto mb-4 font-bold shadow-md shadow-purple-500/20">
            ⚡
          </div>
          <h2 className="text-xl font-extrabold text-center text-zinc-900 dark:text-white mb-2">
            Themes Developer Portal
          </h2>
          <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mb-6">
            Sign in with your verified administrator or developer credentials to publish and manage storefront themes.
          </p>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Developer Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@apexstore.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#960DF2] hover:bg-[#780AC2] transition-colors shadow-md shadow-purple-500/25 disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? "Verifying..." : "Sign In to Developer Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Developer Portal View
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Developer Session Active
            </span>
            <span className="text-xs text-zinc-400 font-mono">{user.email}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Themes Hub Developer Studio
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Publish high-conversion edge themes, test live mockups, and track submission approval status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setActiveTab("create");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#960DF2] hover:bg-[#780AC2] shadow-sm transition-colors cursor-pointer"
          >
            + Upload New Theme
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "list"
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          My Submitted Themes ({themes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "create"
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          {editingId ? "Edit Theme Listing" : "Upload &amp; Submit Theme"}
        </button>
      </div>

      {/* Tab 1: My Themes */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {themes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                No themes submitted yet
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
                You haven&apos;t published any themes to the marketplace yet.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#960DF2] hover:bg-[#780AC2]"
              >
                Create Your First Theme
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => {
                const statusColors = {
                  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                  rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
                  draft: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
                  delisted: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
                };
                const badgeStyle = statusColors[theme.status] || statusColors.draft;

                return (
                  <div
                    key={theme.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          {theme.themeId}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}
                        >
                          {theme.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                        {theme.description || "No description provided."}
                      </p>

                      {theme.status === "rejected" && theme.rejectionReason && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] mb-3">
                          <strong>Rejection reason:</strong> {theme.rejectionReason}
                        </div>
                      )}

                      <div className="text-[11px] text-zinc-400 space-y-1">
                        <div>Version: v{theme.version}</div>
                        <div>Category: {theme.category}</div>
                        <div>Pricing: {theme.pricing === "free" ? "Free" : `$${theme.price}`}</div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPreviewModalTheme(theme)}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        👁️ Live Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditTheme(theme)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        Edit &amp; Resubmit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Create / Edit Form */}
      {activeTab === "create" && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {editingId ? `Editing Theme: ${name}` : "Submit New Storefront Theme"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Provide theme metadata, screenshots, and configuration tokens. Submissions enter the Nasrify Team approval queue.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-6">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6">
              {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Metadata */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Theme ID (kebab-case) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingId}
                  value={themeId}
                  onChange={(e) => setThemeId(e.target.value)}
                  placeholder="minimal-noir"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-60 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Theme Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Minimal Noir"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Version *
                  </label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-contrast modern monochromatic theme optimized for conversion..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Atelier Studio"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Author Website URL
                  </label>
                  <input
                    type="url"
                    value={authorUrl}
                    onChange={(e) => setAuthorUrl(e.target.value)}
                    placeholder="https://atelier.design"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Minimal">Minimal</option>
                    <option value="Bold">Bold</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Kids">Kids</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Pricing *
                  </label>
                  <select
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Price ($USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={pricing === "free"}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-40 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Preview Image Upload */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Theme Preview Image (Upload to Cloudflare R2)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleUploadImage(e.target.files[0], true);
                      }
                    }}
                    className="text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950 dark:file:text-purple-300 hover:file:bg-purple-100"
                  />
                  {uploadingImage && <span className="text-xs text-purple-600">Uploading to R2...</span>}
                </div>
                {previewUrl && (
                  <p className="text-[11px] font-mono text-emerald-600 mt-1 truncate">
                    Saved: {previewUrl}
                  </p>
                )}
              </div>

              {/* Changelog */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Changelog / Release Notes
                </label>
                <textarea
                  rows={2}
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="v1.0.0 - Initial public release"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Right Column: Theme Config JSON + Live Interactive Test */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Theme Config JSON (Design Tokens)
                </label>
                <span className="text-[11px] text-zinc-400">Colors, Typography, Layout</span>
              </div>

              <textarea
                rows={12}
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {/* Quick Mockup Preview Trigger */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    Preview Interactive Storefront Mockup
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Verify colors, headers, and card layouts before submitting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewModalTheme({
                      id: "test",
                      themeId: themeId || "preview-theme",
                      name: name || "Untitled Theme",
                      author: author || "You",
                      authorUrl: authorUrl || null,
                      version,
                      configJson,
                      previewUrl: previewUrl || null,
                      screenshotUrls: JSON.stringify(screenshotUrls),
                      category,
                      pricing,
                      price: parseFloat(price) || 0,
                      status: "draft",
                      submittedBy: user.email,
                      submittedAt: Date.now(),
                      approvedBy: null,
                      approvedAt: null,
                      rejectionReason: null,
                      downloadUrl: null,
                      changelog,
                      description,
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                >
                  👁️ Test Live Preview
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={() => handleSubmit(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={() => handleSubmit(true)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#960DF2] hover:bg-[#780AC2] shadow-md shadow-purple-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewModalTheme && (
        <ThemeMockupPreview
          theme={previewModalTheme}
          isModal={true}
          onClose={() => setPreviewModalTheme(null)}
        />
      )}
    </div>
  );
}

export default ThemeDeveloperPortalClient;
