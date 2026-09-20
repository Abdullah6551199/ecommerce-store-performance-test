"use client";

import { useState } from "react";
import type { MarketplaceListing } from "@/types/marketplace";

interface Props {
  initialUser: {
    id: string;
    email: string;
    role: string;
  } | null;
  initialApps: MarketplaceListing[];
}

export function DeveloperPortalClient({ initialUser, initialApps }: Props) {
  const [user, setUser] = useState(initialUser);
  const [apps, setApps] = useState<MarketplaceListing[]>(initialApps);
  const [activeTab, setActiveTab] = useState<"listings" | "submit" | "guide">("listings");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Submit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    appId: "",
    name: "",
    version: "1.0.0",
    description: "",
    author: user ? user.email.split("@")[0] : "",
    authorUrl: "",
    iconUrl: "",
    category: "sales",
    pricing: "free" as "free" | "paid",
    price: 0,
    manifestJson: JSON.stringify(
      {
        id: "my-app",
        name: "My Custom App",
        version: "1.0.0",
        permissions: ["read:products"],
        extensionPoints: ["storefront.floating"],
      },
      null,
      2
    ),
    changelog: "1.0.0 - Initial release",
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

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
      // Fetch user apps
      const appsRes = await fetch("/api/developer/my-apps");
      const appsData: any = await appsRes.json();
      if (appsData.success) {
        setApps(appsData.apps);
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/developer/logout", { method: "POST" });
    setUser(null);
    setApps([]);
  }

  function startEdit(app: MarketplaceListing) {
    setEditingId(app.id);
    setFormData({
      appId: app.appId,
      name: app.name,
      version: app.version,
      description: app.description || "",
      author: app.author || "",
      authorUrl: app.authorUrl || "",
      iconUrl: app.iconUrl || "",
      category: app.category || "sales",
      pricing: (app.pricing as "free" | "paid") || "free",
      price: app.price || 0,
      manifestJson: app.manifestJson || "",
      changelog: app.changelog || "",
    });
    setActiveTab("submit");
    setFormMessage(null);
  }

  function resetForm() {
    setEditingId(null);
    setFormData({
      appId: "",
      name: "",
      version: "1.0.0",
      description: "",
      author: user ? user.email.split("@")[0] : "",
      authorUrl: "",
      iconUrl: "",
      category: "sales",
      pricing: "free",
      price: 0,
      manifestJson: "",
      changelog: "",
    });
    setFormMessage(null);
  }

  async function handleSubmit(submitForReview: boolean) {
    setFormLoading(true);
    setFormMessage(null);

    try {
      const payload = {
        id: editingId || undefined,
        ...formData,
        price: Number(formData.price) || 0,
        submitForReview,
      };

      const res = await fetch("/api/developer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: any = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit app");
      }

      setFormMessage({
        type: "success",
        text: data.message || "App submission updated successfully!",
      });

      // Refresh list
      const appsRes = await fetch("/api/developer/my-apps");
      const appsData: any = await appsRes.json();
      if (appsData.success) {
        setApps(appsData.apps);
      }

      setTimeout(() => {
        setActiveTab("listings");
        resetForm();
      }, 1200);
    } catch (err: any) {
      setFormMessage({
        type: "error",
        text: err.message || "Error submitting app",
      });
    } finally {
      setFormLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl mx-auto mb-3 font-bold">
              ⚡
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Developer Portal
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Sign in with your Nasrify account to manage apps and publish to the marketplace.
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Admin / Developer Email
              </label>
              <input
                id="developer-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@apexstore.com"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                id="developer-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              id="developer-login-submit"
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loginLoading ? "Authenticating..." : "Sign In to Developer Portal"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-400">
              Shared session with Nasrify Admin. If already logged into Admin in this browser, you are automatically recognized.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Nasrify Developer Console
          </span>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5">
            Developer Workspace
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Logged in as <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setActiveTab("submit");
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
          >
            + Submit New App
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "listings"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          My Listings ({apps.length})
        </button>
        <button
          onClick={() => setActiveTab("submit")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "submit"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          {editingId ? "Edit Listing" : "Submit New App"}
        </button>
        <button
          onClick={() => setActiveTab("guide")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "guide"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          App Guidelines & Manifest
        </button>
      </div>

      {/* TAB 1: My Listings */}
      {activeTab === "listings" && (
        <div className="space-y-6">
          {apps.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center text-2xl mx-auto mb-4">
                📦
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                No Apps Submitted Yet
              </h3>
              <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1 mb-6">
                You haven&apos;t submitted any apps to the Nasrify Marketplace yet. Create your first listing to start reaching merchants.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("submit");
                }}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              >
                Submit Your First App
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">App</th>
                      <th className="px-6 py-3.5">Version</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Pricing</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {apps.map((app) => {
                      const statusStyles: Record<string, string> = {
                        approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                        pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                        rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
                        draft: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
                        delisted: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                      };

                      return (
                        <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-lg flex-shrink-0">
                                {app.iconUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={app.iconUrl} alt={app.name} className="w-7 h-7 object-contain" />
                                ) : (
                                  <span>⚡</span>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-zinc-900 dark:text-white">
                                  {app.name}
                                </div>
                                <div className="text-xs font-mono text-zinc-400">
                                  {app.appId}
                                </div>
                              </div>
                            </div>
                            {app.rejectionReason && (
                              <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900">
                                <span className="font-bold">Rejection Note: </span>
                                {app.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                            v{app.version}
                          </td>
                          <td className="px-6 py-4 capitalize text-zinc-600 dark:text-zinc-300">
                            {app.category}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                statusStyles[app.status] || statusStyles.draft
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                            {app.pricing === "paid" && app.price ? `$${app.price}` : "Free"}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => startEdit(app)}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Edit
                            </button>
                            {app.status === "approved" && (
                              <a
                                href={`/apps/${app.appId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 ml-2"
                              >
                                View Live ↗
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Submit / Edit Form */}
      {activeTab === "submit" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm max-w-3xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {editingId ? "Edit App Listing" : "Submit New App to Marketplace"}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Fill in the details below. Once submitted, super admins review submissions before they appear on the public hub.
              </p>
            </div>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {formMessage && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                formMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              {formMessage.text}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  App ID (kebab-case identifier) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingId}
                  value={formData.appId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    })
                  }
                  placeholder="e.g. order-sms-alerts"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Order SMS Alerts"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Version *
                </label>
                <input
                  type="text"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="orders">Orders & Shipping</option>
                  <option value="tools">Tools & Utilities</option>
                  <option value="design">Design & UI</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Pricing *
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.pricing}
                    onChange={(e) =>
                      setFormData({ ...formData, pricing: e.target.value as "free" | "paid" })
                    }
                    className="w-1/2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                  {formData.pricing === "paid" && (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="$ USD"
                      className="w-1/2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Author / Developer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. Acme Devs"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Author URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.authorUrl}
                  onChange={(e) => setFormData({ ...formData, authorUrl: e.target.value })}
                  placeholder="https://acme.dev"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Icon URL (SVG or PNG)
              </label>
              <input
                type="text"
                value={formData.iconUrl}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                placeholder="https://... or data:image/svg+xml..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your app does, key benefits, and setup instructions..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Manifest JSON
              </label>
              <textarea
                rows={5}
                value={formData.manifestJson}
                onChange={(e) => setFormData({ ...formData, manifestJson: e.target.value })}
                placeholder={`{\n  "id": "my-app",\n  "name": "My App",\n  "permissions": ["read:products"]\n}`}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Paste your app&apos;s manifest.json structure. This defines extensions and permissions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Changelog / Release Notes
              </label>
              <textarea
                rows={2}
                value={formData.changelog}
                onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                placeholder="1.0.0 - Initial release"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                id="save-draft-btn"
                type="button"
                disabled={formLoading}
                onClick={() => handleSubmit(false)}
                className="px-5 py-3 rounded-xl font-semibold text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                id="submit-approval-btn"
                type="button"
                disabled={formLoading}
                onClick={() => handleSubmit(true)}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 text-center"
              >
                {formLoading ? "Submitting..." : "Submit for Approval (Pending Review)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Guidelines */}
      {activeTab === "guide" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 max-w-3xl">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Nasrify App Marketplace Developer Guidelines
          </h2>

          <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              Nasrify apps run within high-performance Cloudflare Workers edge architecture. To ensure extreme speed and zero cold starts for merchants, apps adhere to modular micro-bundles.
            </p>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white pt-2">
              1. Required App Manifest Fields
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs font-mono">
              <li>id: Kebab-case string (e.g. &quot;whatsapp-order&quot;)</li>
              <li>name: Human-friendly name</li>
              <li>version: Semver string (e.g. &quot;1.0.0&quot;)</li>
              <li>extensionPoints: Array of slots (&quot;storefront.floating&quot;, &quot;admin.dashboard.widget&quot;)</li>
              <li>permissions: Explicit access tags (&quot;read:products&quot;, &quot;read:orders&quot;)</li>
            </ul>

            <h3 className="text-base font-semibold text-zinc-900 dark:text-white pt-2">
              2. Approval Queue Process
            </h3>
            <p>
              When submitted for review, your app is placed into the Super Admin approval queue. Reviewers inspect manifest security permissions, database schema compliance, and code quality before approving your app for public discovery.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
