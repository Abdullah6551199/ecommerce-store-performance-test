"use client";

import React, { useState, useEffect } from "react";
import LucideIcon from "@/components/icons/LucideIcon";
import type { TrustBadgeItem, PaymentIconItem, TrustBadgesAppSettings } from "../shared/types";
import { DEFAULT_TRUST_BADGES_SETTINGS } from "../shared/types";
import { StandardPaymentSvg } from "../shared/payment-icons";

const COMMON_ICONS = [
  "shield-check",
  "refresh-cw",
  "truck",
  "headphones",
  "badge-check",
  "credit-card",
  "lock",
  "award",
  "zap",
  "heart",
  "package",
  "check-circle",
  "star",
  "clock",
  "smile",
  "thumbs-up",
];

export default function TrustBadgesManager(): React.JSX.Element {
  const [badges, setBadges] = useState<TrustBadgeItem[]>([]);
  const [paymentIcons, setPaymentIcons] = useState<PaymentIconItem[]>([]);
  const [settings, setSettings] = useState<TrustBadgesAppSettings>(DEFAULT_TRUST_BADGES_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"badges" | "payment" | "settings" | "preview">("badges");

  // Badge Form State
  const [isEditingBadge, setIsEditingBadge] = useState(false);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const [badgeForm, setBadgeForm] = useState({
    title: "",
    icon: "shield-check",
    description: "",
    location: "all",
    isActive: true,
  });

  // Payment Icon Form State
  const [paymentName, setPaymentName] = useState("");
  const [paymentSvg, setPaymentSvg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, pRes, sRes] = await Promise.all([
        fetch("/api/admin/trust-badges").then((r) => r.json() as Promise<any>),
        fetch("/api/admin/payment-icons").then((r) => r.json() as Promise<any>),
        fetch("/api/admin/apps/trust-badges/settings").then((r) => r.json() as Promise<any>),
      ]);

      if (bRes.success) setBadges(bRes.data || []);
      if (pRes.success) setPaymentIcons(pRes.data || []);
      if (sRes.success && sRes.data) setSettings({ ...DEFAULT_TRUST_BADGES_SETTINGS, ...sRes.data });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load trust badges data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddBadge = () => {
    setIsEditingBadge(true);
    setEditingBadgeId(null);
    setBadgeForm({
      title: "",
      icon: "shield-check",
      description: "",
      location: "all",
      isActive: true,
    });
  };

  const openEditBadge = (badge: TrustBadgeItem) => {
    setIsEditingBadge(true);
    setEditingBadgeId(badge.id);
    setBadgeForm({
      title: badge.title,
      icon: badge.icon,
      description: badge.description || "",
      location: badge.location,
      isActive: badge.isActive,
    });
  };

  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeForm.title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      if (editingBadgeId) {
        const res = await fetch(`/api/admin/trust-badges/${editingBadgeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingBadgeId,
            ...badgeForm,
          }),
        });
        const json = (await res.json()) as any;
        if (json.success) {
          setMessage({ type: "success", text: "Trust badge updated successfully" });
          setIsEditingBadge(false);
          await fetchData();
        } else {
          setMessage({ type: "error", text: json.error || "Failed to update badge" });
        }
      } else {
        const res = await fetch("/api/admin/trust-badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...badgeForm,
            sortOrder: badges.length + 1,
          }),
        });
        const json = (await res.json()) as any;
        if (json.success) {
          setMessage({ type: "success", text: "Trust badge created successfully" });
          setIsEditingBadge(false);
          await fetchData();
        } else {
          setMessage({ type: "error", text: json.error || "Failed to create badge" });
        }
      }
    } catch (_err) {
      setMessage({ type: "error", text: "Error saving trust badge" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBadge = async (badge: TrustBadgeItem) => {
    try {
      const res = await fetch(`/api/admin/trust-badges/${badge.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !badge.isActive,
        }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setBadges((prev) =>
          prev.map((b) => (b.id === badge.id ? { ...b, isActive: !badge.isActive } : b))
        );
      }
    } catch (_err) {
      setMessage({ type: "error", text: "Failed to toggle badge status" });
    }
  };

  const handleDeleteBadge = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trust badge?")) return;
    try {
      const res = await fetch(`/api/admin/trust-badges/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setBadges((prev) => prev.filter((b) => b.id !== id));
        setMessage({ type: "success", text: "Badge deleted successfully" });
      }
    } catch (_err) {
      setMessage({ type: "error", text: "Failed to delete badge" });
    }
  };

  const moveBadge = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= badges.length) return;

    const newBadges = [...badges];
    const temp = newBadges[index];
    newBadges[index] = newBadges[targetIdx];
    newBadges[targetIdx] = temp;

    setBadges(newBadges);

    try {
      await fetch("/api/admin/trust-badges/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: newBadges.map((b) => b.id),
        }),
      });
    } catch (_err) {
      setMessage({ type: "error", text: "Failed to save badge order" });
    }
  };

  const handleTogglePaymentIcon = async (icon: PaymentIconItem) => {
    try {
      const res = await fetch(`/api/admin/payment-icons/${icon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !icon.isActive,
        }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setPaymentIcons((prev) =>
          prev.map((p) => (p.id === icon.id ? { ...p, isActive: !icon.isActive } : p))
        );
      }
    } catch (_err) {
      setMessage({ type: "error", text: "Failed to toggle payment icon" });
    }
  };

  const handleAddPaymentIcon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentName.trim()) return;

    try {
      const res = await fetch("/api/admin/payment-icons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: paymentName.trim(),
          iconSvg: paymentSvg.trim() || undefined,
          sortOrder: paymentIcons.length + 1,
        }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setPaymentIcons((prev) => [...prev, json.data]);
        setPaymentName("");
        setPaymentSvg("");
        setMessage({ type: "success", text: "Payment icon added" });
      }
    } catch (_err) {
      setMessage({ type: "error", text: "Failed to add payment icon" });
    }
  };

  const handleDeletePaymentIcon = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment icon?")) return;
    try {
      const res = await fetch(`/api/admin/payment-icons/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setPaymentIcons((prev) => prev.filter((p) => p.id !== id));
        setMessage({ type: "success", text: "Payment icon deleted" });
      }
    } catch (_err) {
      setMessage({ type: "error", text: "Failed to delete payment icon" });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/apps/trust-badges/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setMessage({ type: "success", text: "Trust Badges app settings saved successfully" });
      } else {
        setMessage({ type: "error", text: json.error || "Failed to save settings" });
      }
    } catch (_err) {
      setMessage({ type: "error", text: "Error saving settings" });
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
            <span className="text-[#25D366]">🛡️</span> Trust Badges & Payment Icons
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure trust seals, security guarantees, and accepted payment icons.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddBadge}
            className="flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#1EA855] transition-colors"
          >
            <LucideIcon name="plus" className="h-4 w-4" /> Add Trust Badge
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
          onClick={() => setActiveTab("badges")}
          className={`px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "badges"
              ? "border-[#25D366] text-[#25D366]"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Trust Badges ({badges.length})
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "payment"
              ? "border-[#25D366] text-[#25D366]"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Payment Icons ({paymentIcons.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "settings"
              ? "border-[#25D366] text-[#25D366]"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Display Settings
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

      {/* TAB 1: Badges List */}
      {activeTab === "badges" && (
        <div className="space-y-4">
          {badges.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500">No trust badges configured yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {badges.map((badge, idx) => (
                <div
                  key={badge.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] dark:bg-[#18181B]/40 text-[#25D366]">
                      <LucideIcon name={badge.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">
                          {badge.title}
                        </h3>
                        <span className="rounded-full bg-[#F4F4F5] dark:bg-[#18181B]/40 px-2 py-0.5 text-[10px] font-bold text-[#25D366] border border-[#E4E4E7] dark:border-zinc-800">
                          {badge.location}
                        </span>
                      </div>
                      {badge.description && (
                        <p className="text-xs text-gray-500 truncate">{badge.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveBadge(idx, "up")}
                      className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      disabled={idx === badges.length - 1}
                      onClick={() => moveBadge(idx, "down")}
                      className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => handleToggleBadge(badge)}
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        badge.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {badge.isActive ? "Active" : "Disabled"}
                    </button>
                    <button
                      onClick={() => openEditBadge(badge)}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="rounded-lg border border-red-200 dark:border-red-800 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Payment Icons */}
      {activeTab === "payment" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Active Payment Icons</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {paymentIcons.map((icon) => (
                <div
                  key={icon.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 p-3 bg-gray-50/50 dark:bg-gray-800/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <StandardPaymentSvg name={icon.name} />
                    <span className="text-xs font-semibold truncate">{icon.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePaymentIcon(icon)}
                      className={`h-5 w-5 rounded-full text-[10px] font-bold ${
                        icon.isActive
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-300 dark:bg-gray-700 text-gray-600"
                      }`}
                    >
                      {icon.isActive ? "✓" : "×"}
                    </button>
                    <button
                      onClick={() => handleDeletePaymentIcon(icon.id)}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleAddPaymentIcon}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4"
          >
            <h3 className="font-bold text-gray-900 dark:text-white">Add Custom Payment Icon</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Method Name
                </label>
                <input
                  type="text"
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  placeholder="e.g. EasyPaisa, JazzCash"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Custom SVG Code (Optional)
                </label>
                <input
                  type="text"
                  value={paymentSvg}
                  onChange={(e) => setPaymentSvg(e.target.value)}
                  placeholder="<svg ...>...</svg>"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-mono text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-gray-900 dark:bg-white dark:text-gray-900 px-4 py-2 text-xs font-bold text-white hover:opacity-90"
            >
              Add Icon
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Display Settings */}
      {activeTab === "settings" && (
        <form
          onSubmit={handleSaveSettings}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6"
        >
          <h3 className="font-bold text-gray-900 dark:text-white">App Display Configuration</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showOnProductPage}
                  onChange={(e) =>
                    setSettings({ ...settings, showOnProductPage: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-[#25D366]"
                />
                <span className="text-sm font-semibold">Show on Product Page</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showOnCartPage}
                  onChange={(e) =>
                    setSettings({ ...settings, showOnCartPage: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-[#25D366]"
                />
                <span className="text-sm font-semibold">Show on Shopping Cart Page</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showOnCheckoutPage}
                  onChange={(e) =>
                    setSettings({ ...settings, showOnCheckoutPage: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-[#25D366]"
                />
                <span className="text-sm font-semibold">Show on Checkout Page</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showPaymentIcons}
                  onChange={(e) =>
                    setSettings({ ...settings, showPaymentIcons: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-[#25D366]"
                />
                <span className="text-sm font-semibold">Show Payment Icons Row</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Badge Alignment
                </label>
                <select
                  value={settings.badgeAlignment}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      badgeAlignment: e.target.value as "left" | "center" | "right",
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="left">Left Aligned</option>
                  <option value="center">Center Aligned</option>
                  <option value="right">Right Aligned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Badge Size
                </label>
                <select
                  value={settings.badgeSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      badgeSize: e.target.value as "sm" | "md" | "lg",
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="sm">Small (Compact)</option>
                  <option value="md">Medium (Default)</option>
                  <option value="lg">Large (Prominent)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1EA855] transition-colors"
          >
            {saving ? "Saving Settings..." : "Save Settings"}
          </button>
        </form>
      )}

      {/* TAB 4: Live Preview */}
      {activeTab === "preview" && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
          <h3 className="font-bold text-gray-900 dark:text-white">Storefront Live Preview</h3>
          <div className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800/30 p-6 bg-[#F4F4F5]/20 dark:bg-[#18181B]/10 space-y-6">
            <div>
              <span className="text-xs font-bold text-[#1EA855] dark:text-zinc-400 block mb-2">
                Standard Card Layout (Product / Cart):
              </span>
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${
                  settings.badgeAlignment === "left"
                    ? "justify-start"
                    : settings.badgeAlignment === "right"
                    ? "justify-end"
                    : "justify-center"
                }`}
              >
                {badges
                  .filter((b) => b.isActive)
                  .slice(0, 4)
                  .map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 rounded-2xl border border-[#E4E4E7]/80 dark:border-zinc-800/30 bg-white/80 dark:bg-gray-900/80 p-3 shadow-xs backdrop-blur-xs"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4F4F5] dark:bg-[#18181B]/50 text-[#25D366]">
                        <LucideIcon name={badge.icon} className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {badge.title}
                        </p>
                        {badge.description && (
                          <p className="text-[10px] text-gray-500 truncate">{badge.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-[#1EA855] dark:text-zinc-400 block mb-2">
                Compact Layout (Checkout):
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {badges
                  .filter((b) => b.isActive)
                  .slice(0, 4)
                  .map((badge) => (
                    <div
                      key={badge.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] dark:border-zinc-800/40 bg-[#F4F4F5]/50 dark:bg-[#18181B]/30 px-3 py-1 text-xs font-semibold text-[#18181B] dark:text-zinc-300"
                    >
                      <LucideIcon name={badge.icon} className="h-3.5 w-3.5 text-[#25D366]" />
                      <span>{badge.title}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Badge */}
      {isEditingBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingBadgeId ? "Edit Trust Badge" : "Create Trust Badge"}
            </h3>

            <form onSubmit={handleSaveBadge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Title</label>
                <input
                  type="text"
                  value={badgeForm.title}
                  onChange={(e) => setBadgeForm({ ...badgeForm, title: e.target.value })}
                  placeholder="e.g. 100% Authentic"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={badgeForm.description}
                  onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                  placeholder="e.g. Verified by official brand partner"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Icon Name</label>
                <select
                  value={badgeForm.icon}
                  onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                >
                  {COMMON_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Display Location</label>
                <select
                  value={badgeForm.location}
                  onChange={(e) => setBadgeForm({ ...badgeForm, location: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="all">All Locations</option>
                  <option value="product">Product Page Only</option>
                  <option value="cart">Cart Page Only</option>
                  <option value="checkout">Checkout Page Only</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBadge(false)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:bg-[#1EA855]"
                >
                  {saving ? "Saving..." : "Save Badge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
