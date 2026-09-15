"use client";

import React, { useState, useEffect } from "react";
import LucideIcon, { LUCIDE_ICON_CHOICES } from "@/components/icons/LucideIcon";
import TrustBadges from "@/components/TrustBadges";
import PaymentIcons, { StandardPaymentSvg } from "@/components/PaymentIcons";
import type { TrustBadgeRecord, PaymentIconRecord } from "@/lib/db";

export default function TrustBadgesManager(): React.JSX.Element {
  const [badges, setBadges] = useState<TrustBadgeRecord[]>([]);
  const [paymentIcons, setPaymentIcons] = useState<PaymentIconRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"badges" | "payment" | "preview">("badges");
  const [previewLocation, setPreviewLocation] = useState<"product" | "cart" | "checkout" | "footer">("product");

  // Badge Modal State
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<TrustBadgeRecord | null>(null);
  const [badgeForm, setBadgeForm] = useState({
    icon: "shield-check",
    title: "",
    description: "",
    location: "all",
    isActive: true,
  });

  // Payment Icon Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    name: "",
    iconSvg: "",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        fetch("/api/admin/trust-badges"),
        fetch("/api/admin/payment-icons"),
      ]);
      const bJson = (await bRes.json()) as any;
      const pJson = (await pRes.json()) as any;
      if (bJson.success) setBadges(bJson.data || []);
      if (pJson.success) setPaymentIcons(pJson.data || []);
    } catch (err) {
      console.warn("Failed to load admin badge data:", err);
      setMessage({ type: "error", text: "Failed to load data from server" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddBadge = () => {
    setEditingBadge(null);
    setBadgeForm({
      icon: "shield-check",
      title: "",
      description: "",
      location: "all",
      isActive: true,
    });
    setBadgeModalOpen(true);
  };

  const openEditBadge = (badge: TrustBadgeRecord) => {
    setEditingBadge(badge);
    setBadgeForm({
      icon: badge.icon,
      title: badge.title,
      description: badge.description || "",
      location: badge.location || "all",
      isActive: badge.isActive ?? true,
    });
    setBadgeModalOpen(true);
  };

  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeForm.title.trim()) {
      alert("Please enter a badge title");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      if (editingBadge) {
        // Update
        const res = await fetch(`/api/admin/trust-badges/${editingBadge.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(badgeForm),
        });
        const json = (await res.json()) as any;
        if (json.success) {
          setMessage({ type: "success", text: "Trust badge updated successfully" });
          setBadgeModalOpen(false);
          fetchData();
        } else {
          setMessage({ type: "error", text: json.error || "Failed to update badge" });
        }
      } else {
        // Create
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
          setBadgeModalOpen(false);
          fetchData();
        } else {
          setMessage({ type: "error", text: json.error || "Failed to create badge" });
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBadge = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trust badge?")) return;
    try {
      const res = await fetch(`/api/admin/trust-badges/${id}`, { method: "DELETE" });
      const json = (await res.json()) as any;
      if (json.success) {
        setMessage({ type: "success", text: "Badge deleted successfully" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to delete badge" });
    }
  };

  const handleToggleBadge = async (badge: TrustBadgeRecord) => {
    try {
      const res = await fetch(`/api/admin/trust-badges/${badge.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !badge.isActive }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newBadges.map((b) => b.id) }),
      });
    } catch (err) {
      console.error("Reorder failed:", err);
    }
  };

  const handleTogglePaymentIcon = async (icon: PaymentIconRecord) => {
    try {
      const res = await fetch(`/api/admin/payment-icons/${icon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !icon.isActive }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const movePaymentIcon = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= paymentIcons.length) return;

    const newIcons = [...paymentIcons];
    const temp = newIcons[index];
    newIcons[index] = newIcons[targetIdx];
    newIcons[targetIdx] = temp;

    setPaymentIcons(newIcons);

    try {
      await fetch("/api/admin/payment-icons/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newIcons.map((i) => i.id) }),
      });
    } catch (err) {
      console.error("Payment icon reorder failed:", err);
    }
  };

  const handleAddPaymentIcon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/payment-icons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentForm,
          sortOrder: paymentIcons.length + 1,
        }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setPaymentModalOpen(false);
        setPaymentForm({ name: "", iconSvg: "", isActive: true });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaymentIcon = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment icon?")) return;
    try {
      const res = await fetch(`/api/admin/payment-icons/${id}`, { method: "DELETE" });
      const json = (await res.json()) as any;
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#3C0561] dark:text-white">
            Trust Badges &amp; Payment Icons
          </h1>
          <p className="text-xs text-[#5A0891]/80 dark:text-[#EACFFC]/70 mt-1">
            Display security, shipping, returns, and payment credibility badges across storefront pages.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("badges")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "badges"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-[#3C0561] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-900/40"
            }`}
          >
            Trust Badges ({badges.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payment")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "payment"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-[#3C0561] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-900/40"
            }`}
          >
            Payment Icons ({paymentIcons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-[#960DF2] text-white shadow-sm"
                : "text-[#3C0561] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-900/40"
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Alert Messages */}
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

      {/* TAB 1: Trust Badges List */}
      {activeTab === "badges" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-white/60">
              Arrange badges by sort order. Badges set to "all" appear across all configured locations.
            </span>
            <button
              type="button"
              onClick={openAddBadge}
              className="inline-flex items-center gap-2 rounded-xl bg-[#960DF2] hover:bg-[#AB3DF5] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              + Add Trust Badge
            </button>
          </div>

          <div className="rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-[#3C0561]/20 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-purple-50/70 dark:bg-purple-950/50 border-b border-purple-100 dark:border-purple-800 text-[#3C0561] dark:text-[#EACFFC] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-16">Sort</th>
                    <th className="py-3 px-4 w-16">Icon</th>
                    <th className="py-3 px-4">Title &amp; Description</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 dark:divide-purple-800/60">
                  {badges.map((badge, idx) => (
                    <tr
                      key={badge.id}
                      className="hover:bg-purple-50/40 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      {/* Sort Order Up/Down */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveBadge(idx, "up")}
                            className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-800 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === badges.length - 1}
                            onClick={() => moveBadge(idx, "down")}
                            className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-800 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>
                      </td>

                      {/* Icon */}
                      <td className="py-3 px-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC]">
                          <LucideIcon name={badge.icon} className="h-4 w-4" />
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#3C0561] dark:text-white">
                          {badge.title}
                        </div>
                        {badge.description && (
                          <div className="text-[11px] text-zinc-500 dark:text-white/60">
                            {badge.description}
                          </div>
                        )}
                      </td>

                      {/* Location Badge */}
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-2.5 py-1 text-[10px] font-bold text-[#960DF2] dark:text-[#EACFFC] uppercase">
                          {badge.location || "all"}
                        </span>
                      </td>

                      {/* Active Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleBadge(badge)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                            badge.isActive ? "bg-[#960DF2]" : "bg-zinc-300 dark:bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              badge.isActive ? "translate-x-4.5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditBadge(badge)}
                            className="px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-[11px] font-bold text-[#3C0561] dark:text-[#EACFFC] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBadge(badge.id)}
                            className="px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] font-bold text-red-600 dark:text-red-400 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Payment Icons */}
      {activeTab === "payment" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-white/60">
              Manage payment badges rendered in the storefront footer and checkout review panel.
            </span>
            <button
              type="button"
              onClick={() => setPaymentModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#960DF2] hover:bg-[#AB3DF5] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              + Add Custom Icon
            </button>
          </div>

          <div className="rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-[#3C0561]/20 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/70 dark:bg-purple-950/50 border-b border-purple-100 dark:border-purple-800 text-[#3C0561] dark:text-[#EACFFC] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-16">Sort</th>
                  <th className="py-3 px-4 w-24">Preview</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 dark:divide-purple-800/60">
                {paymentIcons.map((icon, idx) => (
                  <tr
                    key={icon.id}
                    className="hover:bg-purple-50/40 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => movePaymentIcon(idx, "up")}
                          className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-800 disabled:opacity-30 cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === paymentIcons.length - 1}
                          onClick={() => movePaymentIcon(idx, "down")}
                          className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-800 disabled:opacity-30 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {icon.iconSvg && icon.iconSvg.trim().startsWith("<svg") ? (
                        <div
                          className="h-6 w-auto flex items-center [&>svg]:h-6"
                          dangerouslySetInnerHTML={{ __html: icon.iconSvg }}
                        />
                      ) : (
                        <StandardPaymentSvg name={icon.name} />
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-[#3C0561] dark:text-white">
                      {icon.name}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePaymentIcon(icon)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                          icon.isActive ? "bg-[#960DF2]" : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            icon.isActive ? "translate-x-4.5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeletePaymentIcon(icon.id)}
                        className="px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] font-bold text-red-600 dark:text-red-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Live Preview Panel */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-purple-200 dark:border-purple-800 pb-3">
            <span className="text-xs font-bold text-[#3C0561] dark:text-white">
              Preview Location:
            </span>
            {(["product", "cart", "checkout", "footer"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setPreviewLocation(loc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  previewLocation === loc
                    ? "bg-[#960DF2] text-white"
                    : "border border-purple-200 dark:border-purple-700 text-[#3C0561] dark:text-[#EACFFC]"
                }`}
              >
                {loc} Page
              </button>
            ))}
          </div>

          <div className="rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800 p-6 bg-white dark:bg-[#3C0561]/20 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                Simulated {previewLocation.toUpperCase()} Preview
              </h3>
              <p className="text-xs text-zinc-500 dark:text-white/60">
                Below is how your active trust badges and payment icons render to visiting shoppers:
              </p>
            </div>

            {/* Badges Component */}
            <div className="p-4 rounded-xl border border-purple-100 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20">
              <TrustBadges location={previewLocation} limit={4} initialBadges={badges.filter((b) => b.isActive)} />
            </div>

            {/* Payment Icons */}
            {(previewLocation === "checkout" || previewLocation === "footer") && (
              <div className="pt-4 border-t border-purple-100 dark:border-purple-800/60">
                <span className="text-xs font-bold block mb-2 text-[#3C0561] dark:text-[#EACFFC]">
                  Payment Method Icons:
                </span>
                <PaymentIcons initialIcons={paymentIcons.filter((i) => i.isActive)} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Badge Modal */}
      {badgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#3C0561] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800 pb-3">
              <h3 className="text-base font-bold text-[#3C0561] dark:text-white">
                {editingBadge ? "Edit Trust Badge" : "Add Trust Badge"}
              </h3>
              <button
                type="button"
                onClick={() => setBadgeModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBadge} className="space-y-4">
              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Lucide Icon (50+ available)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC]">
                    <LucideIcon name={badgeForm.icon} className="h-5 w-5" />
                  </div>
                  <select
                    value={badgeForm.icon}
                    onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                    className="flex-1 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                  >
                    {LUCIDE_ICON_CHOICES.map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Secure Checkout"
                  value={badgeForm.title}
                  onChange={(e) => setBadgeForm({ ...badgeForm, title: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 256-bit SSL Encryption"
                  value={badgeForm.description}
                  onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                />
              </div>

              {/* Location Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Storefront Location
                </label>
                <select
                  value={badgeForm.location}
                  onChange={(e) => setBadgeForm({ ...badgeForm, location: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                >
                  <option value="all">All Pages (Global)</option>
                  <option value="product">Product Page Only</option>
                  <option value="cart">Cart Page Only</option>
                  <option value="checkout">Checkout Page Only</option>
                  <option value="footer">Footer Only</option>
                </select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="badge-active-check"
                  checked={badgeForm.isActive}
                  onChange={(e) => setBadgeForm({ ...badgeForm, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-purple-300 text-[#960DF2] focus:ring-[#960DF2]"
                />
                <label htmlFor="badge-active-check" className="text-xs font-bold text-[#3C0561] dark:text-white">
                  Active (Visible on Storefront)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-purple-100 dark:border-purple-800">
                <button
                  type="button"
                  onClick={() => setBadgeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-700 text-xs font-bold text-[#3C0561] dark:text-[#EACFFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#960DF2] hover:bg-[#AB3DF5] text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingBadge ? "Save Changes" : "Create Badge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Payment Icon Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#3C0561] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800 pb-3">
              <h3 className="text-base font-bold text-[#3C0561] dark:text-white">
                Add Custom Payment Icon
              </h3>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPaymentIcon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Brand Name (e.g. Klarna, Stripe, Discover)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Klarna"
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] mb-1">
                  Custom SVG Code (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="<svg ...>...</svg>"
                  value={paymentForm.iconSvg}
                  onChange={(e) => setPaymentForm({ ...paymentForm, iconSvg: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/40 p-2.5 text-xs text-[#3C0561] dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-purple-100 dark:border-purple-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-700 text-xs font-bold text-[#3C0561] dark:text-[#EACFFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#960DF2] hover:bg-[#AB3DF5] text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Icon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
