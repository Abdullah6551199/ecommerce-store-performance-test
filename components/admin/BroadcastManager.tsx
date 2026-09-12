"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { BroadcastAdminItem } from "@/lib/broadcasts";

export default function BroadcastManager(): React.JSX.Element {
  const [broadcasts, setBroadcasts] = useState<BroadcastAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [type, setType] = useState<"info" | "promotion" | "announcement" | "warning">("promotion");
  const [target, setTarget] = useState<"all" | "registered" | "guest">("all");
  const [scheduledFor, setScheduledFor] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");

  // Load broadcasts
  const fetchBroadcasts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/broadcasts");
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          broadcasts?: BroadcastAdminItem[];
        };
        setBroadcasts(data.broadcasts || []);
      }
    } catch (err) {
      console.error("Failed to load broadcasts:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  // Handle Form Submit
  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!title.trim() || !message.trim()) {
      setAlert({ text: "Please enter both a title and a message.", type: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        message: message.trim(),
        imageUrl: imageUrl.trim() || null,
        linkUrl: linkUrl.trim() || null,
        buttonText: buttonText.trim() || null,
        type,
        target,
        scheduledFor: scheduleMode === "later" && scheduledFor ? new Date(scheduledFor).toISOString() : null,
      };

      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { success?: boolean; error?: string; message?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create broadcast notification");
      }

      setAlert({ text: "Broadcast notification dispatched successfully!", type: "success" });
      // Reset form
      setTitle("");
      setMessage("");
      setImageUrl("");
      setLinkUrl("");
      setButtonText("");
      setScheduleMode("now");
      setScheduledFor("");
      fetchBroadcasts();
    } catch (err: unknown) {
      setAlert({
        text: err instanceof Error ? err.message : "Error creating broadcast",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Broadcast
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcast? This will remove its analytics.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/broadcasts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBroadcasts();
      }
    } catch (err) {
      console.error("Failed to delete broadcast:", err);
    }
  };

  // Compute overall stats
  const totalViews = broadcasts.reduce((acc, b) => acc + (b.stats?.totalViews || 0), 0);
  const totalDismissed = broadcasts.reduce((acc, b) => acc + (b.stats?.totalDismissed || 0), 0);
  const totalClicks = broadcasts.reduce((acc, b) => acc + (b.stats?.totalClicks || 0), 0);
  const averageCtr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          <span>Marketing & Announcements</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-1">
          Broadcast Notifications
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
          Dispatch promotional popups and storewide notices to all visitors, registered members, or guests with real-time impression and click tracking.
        </p>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Broadcasts Sent</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1.5">{broadcasts.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Total Impressions</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5">{totalViews}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Dismissed</p>
          <p className="text-2xl font-black text-zinc-600 dark:text-zinc-300 mt-1.5">{totalDismissed}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Average CTR</p>
          <p className="text-2xl font-black text-[#18C729] mt-1.5">{averageCtr}%</p>
        </div>
      </div>

      {/* Main Grid: Form + Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </span>
            <span>Create New Broadcast</span>
          </h2>

          {alert && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold mb-6 ${
                alert.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {alert.text}
            </div>
          )}

          <form onSubmit={handleCreateBroadcast} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., ⚡ Flash Sale: 25% Off All Orders!"
                required
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Use coupon code FLASH25 at checkout to enjoy 25% off storewide. Valid through Sunday midnight!"
                required
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Type & Target Grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Broadcast Type */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Notification Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="promotion">Promotion (Special Offer)</option>
                  <option value="announcement">Announcement (Store Update)</option>
                  <option value="info">Info (General Notice)</option>
                  <option value="warning">Warning (Urgent Alert)</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Target Audience
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Visitors (Guests & Members)</option>
                  <option value="registered">Registered Members Only</option>
                  <option value="guest">Guest Visitors Only</option>
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Header Image URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or /images/..."
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Button Text & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Button Label (Optional)
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="e.g., Shop Now, Claim 25% Off"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Target Link / URL (Optional)
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g., /shop, /category/shoes"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Schedule Option */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleMode"
                    value="now"
                    checked={scheduleMode === "now"}
                    onChange={() => setScheduleMode("now")}
                    className="text-purple-600"
                  />
                  <span>Send Immediately</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleMode"
                    value="later"
                    checked={scheduleMode === "later"}
                    onChange={() => setScheduleMode("later")}
                    className="text-purple-600"
                  />
                  <span>Schedule For Later</span>
                </label>
              </div>

              {scheduleMode === "later" && (
                <div>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching Broadcast...</span>
              ) : (
                <>
                  <span>🚀 Dispatch Broadcast Notification</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Storefront Preview
            </span>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
              Audience: {target.toUpperCase()}
            </span>
          </div>

          {/* Rendered Mockup of Storefront Popup Modal */}
          <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-[#18C729]" />

            {/* Mock Close Button */}
            <div className="absolute top-4 right-4 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            {/* Header Image if available */}
            {imageUrl ? (
              <div className="relative w-full h-40 bg-zinc-100 dark:bg-white/5 overflow-hidden">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ) : (
              <div className="w-full h-10" />
            )}

            <div className="p-6 space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {type.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight leading-snug">
                  {title || "Your Broadcast Title Will Appear Here"}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {message || "Enter your promotional text or announcement message to see it styled here in real time."}
                </p>
              </div>

              {/* Action Button Preview */}
              {(buttonText || linkUrl) && (
                <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 text-center flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>{buttonText || "Learn More"}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60">
                <label className="flex items-center gap-1.5 select-none">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-purple-600" />
                  <span>Don&apos;t show again</span>
                </label>
                <span className="underline cursor-pointer">Dismiss</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Broadcast History & Analytics</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Performance tracking across customer and guest views</p>
          </div>
          <button
            type="button"
            onClick={fetchBroadcasts}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400 animate-pulse">Loading broadcast history...</div>
        ) : broadcasts.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500">
            No broadcast notifications sent yet. Create your first broadcast above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Broadcast</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Sent At</th>
                  <th className="py-3 px-4 text-center">Impressions</th>
                  <th className="py-3 px-4 text-center">Dismissed</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-center">CTR</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                {broadcasts.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-bold text-zinc-900 dark:text-white truncate">{b.title}</p>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{b.message}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {b.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {b.target}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString()} {new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-purple-600 dark:text-purple-400">
                      {b.stats?.totalViews || 0}
                    </td>
                    <td className="py-4 px-4 text-center text-zinc-500">
                      {b.stats?.totalDismissed || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-zinc-900 dark:text-white">
                      {b.stats?.totalClicks || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-[#18C729]">
                      {b.stats?.ctr || 0}%
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-[11px] transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
