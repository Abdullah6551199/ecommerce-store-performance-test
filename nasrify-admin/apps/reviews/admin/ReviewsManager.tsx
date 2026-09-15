"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ReviewImage {
  id: string;
  imageUrl: string;
}

interface ReviewRecord {
  id: string;
  productId: string;
  orderId: string | null;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string | null;
  content: string;
  isVerifiedPurchase: number;
  status: "pending" | "approved" | "rejected";
  helpfulCount: number;
  notHelpfulCount: number;
  adminReply: string | null;
  adminReplyAt: string | null;
  createdAt: string;
  images: ReviewImage[];
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
}

interface ReviewSettings {
  autoApprove: boolean;
  requireVerifiedPurchase: boolean;
  allowImages: boolean;
  maxImages: number;
}

export default function ReviewsManager(): React.JSX.Element {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0,
  });
  const [settings, setSettings] = useState<ReviewSettings>({
    autoApprove: false,
    requireVerifiedPurchase: false,
    allowImages: true,
    maxImages: 5,
  });

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reply Modal
  const [replyingReview, setReplyingReview] = useState<ReviewRecord | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Reject Modal
  const [rejectingReview, setRejectingReview] = useState<ReviewRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Settings Panel Toggle
  const [showSettings, setShowSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reviews/stats");
      const json = (await res.json()) as any;
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reviews/settings");
      const json = (await res.json()) as any;
      if (json.success && json.data) {
        setSettings(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        search: searchQuery,
        page: String(page),
        limit: "15",
      });
      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const json = (await res.json()) as any;
      if (json.success && json.data) {
        setReviews(json.data.reviews || []);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, page]);

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, [fetchStats, fetchSettings]);

  useEffect(() => {
    fetchReviews();
    setSelectedIds([]);
  }, [fetchReviews]);

  // Notice helper
  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Single Action: Approve
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        showNotice("Review approved successfully.");
        fetchReviews();
        fetchStats();
      }
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  // Single Action: Reject
  const handleConfirmReject = async () => {
    if (!rejectingReview) return;
    try {
      const res = await fetch(`/api/admin/reviews/${rejectingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", reason: rejectReason }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        showNotice("Review rejected.");
        setRejectingReview(null);
        setRejectReason("");
        fetchReviews();
        fetchStats();
      }
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  // Single Action: Reply
  const handleSaveReply = async () => {
    if (!replyingReview) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/admin/reviews/${replyingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: replyText.trim() || null }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        showNotice("Store owner reply saved.");
        setReplyingReview(null);
        setReplyText("");
        fetchReviews();
      }
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Single Action: Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const json = (await res.json()) as any;
      if (json.success) {
        showNotice("Review deleted.");
        fetchReviews();
        fetchStats();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: "approve" | "reject" | "delete") => {
    if (selectedIds.length === 0) return;
    if (action === "delete" && !confirm(`Permanently delete ${selectedIds.length} reviews?`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/reviews/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        showNotice(`Bulk ${action} completed on ${selectedIds.length} reviews.`);
        setSelectedIds([]);
        fetchReviews();
        fetchStats();
      }
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/admin/reviews/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        showNotice("Review settings saved successfully.");
        setShowSettings(false);
      }
    } catch (err) {
      console.error("Save settings failed:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Select all checkbox
  const toggleSelectAll = () => {
    if (selectedIds.length === reviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reviews.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Reviews & Ratings Moderation
          </h1>
          <p className="text-xs text-zinc-500 dark:text-white/60 mt-1">
            Approve, reject, reply to customer feedback, and configure review policies
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSettings((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 dark:border-white/10 text-xs font-semibold text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
        >
          <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          {showSettings ? "Close Settings" : "Review Settings"}
        </button>
      </div>

      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* STATS KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c140f] border border-zinc-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-white/50 uppercase">Total</span>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{stats.total}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c140f] border border-zinc-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Pending</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{stats.pending}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c140f] border border-zinc-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Approved</span>
          <p className="text-2xl font-black text-[#18C729] mt-1">{stats.approved}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c140f] border border-zinc-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase">Rejected</span>
          <p className="text-2xl font-black text-red-500 mt-1">{stats.rejected}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c140f] border border-zinc-200 dark:border-white/10 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-white/50 uppercase">Avg Rating</span>
          <p className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"} <span className="text-sm">★</span>
          </p>
        </div>
      </div>

      {/* SETTINGS PANEL */}
      {showSettings && (
        <form
          onSubmit={handleSaveSettings}
          className="p-5 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Review System Settings</h3>
            <span className="text-xs text-zinc-500">Global moderation rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Auto Approve */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">Auto-approve</p>
                <p className="text-[10px] text-zinc-500">Publish without moderation</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoApprove}
                onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
                className="h-4 w-4 rounded accent-[#18C729]"
              />
            </div>

            {/* Require Verified Purchase */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">Require Verified</p>
                <p className="text-[10px] text-zinc-500">Only actual buyers can review</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireVerifiedPurchase}
                onChange={(e) =>
                  setSettings({ ...settings, requireVerifiedPurchase: e.target.checked })
                }
                className="h-4 w-4 rounded accent-[#18C729]"
              />
            </div>

            {/* Allow Images */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">Allow Images</p>
                <p className="text-[10px] text-zinc-500">Let buyers upload photos</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowImages}
                onChange={(e) => setSettings({ ...settings, allowImages: e.target.checked })}
                className="h-4 w-4 rounded accent-[#18C729]"
              />
            </div>

            {/* Max Images */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">Max Images</p>
                <p className="text-[10px] text-zinc-500">Up to 10 photos</p>
              </div>
              <input
                type="number"
                min={1}
                max={10}
                value={settings.maxImages}
                onChange={(e) =>
                  setSettings({ ...settings, maxImages: parseInt(e.target.value, 10) || 5 })
                }
                className="w-14 px-2 py-1 text-xs rounded border border-zinc-300 dark:border-white/10 bg-transparent text-right"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#18C729] hover:bg-[#15b024] transition-colors shadow-sm"
            >
              {isSavingSettings ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}

      {/* FILTER TABS & SEARCH BAR & BULK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200/80 dark:border-white/5">
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? "bg-white dark:bg-[#0c140f] text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search customer, title, product..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#0c140f] text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
          />
          <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
            {selectedIds.length} {selectedIds.length === 1 ? "review" : "reviews"} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkAction("approve")}
              className="px-3 py-1 rounded-lg bg-[#18C729] text-white font-semibold hover:bg-[#15b024] transition-colors"
            >
              Approve Selected
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction("reject")}
              className="px-3 py-1 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-600 transition-colors"
            >
              Reject Selected
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* REVIEWS TABLE / LIST */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-white/50">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={reviews.length > 0 && selectedIds.length === reviews.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded accent-[#18C729]"
            />
            <span>Select All</span>
          </div>
          <span>Showing {reviews.length} reviews (Page {page} of {totalPages})</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-zinc-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center space-y-1 text-xs text-zinc-500">
            <p className="font-semibold text-sm">No reviews found</p>
            <p>Try switching status tabs or clearing search filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-white/5">
            {reviews.map((rev) => {
              const isSelected = selectedIds.includes(rev.id);
              const statusBadge =
                rev.status === "approved"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : rev.status === "rejected"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";

              return (
                <div key={rev.id} className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between hover:bg-zinc-50/50 dark:hover:bg-white/[0.01]">
                  {/* Left info & content */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(rev.id)}
                      className="mt-1 h-4 w-4 rounded accent-[#18C729]"
                    />

                    <div className="space-y-2 min-w-0 flex-1">
                      {/* Top Row: Rating, status, badges, date */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex text-amber-400 text-xs">
                          {"★".repeat(rev.rating)}
                          {"☆".repeat(5 - rev.rating)}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusBadge} uppercase`}>
                          {rev.status}
                        </span>
                        {rev.isVerifiedPurchase === 1 && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Verified Purchase
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Title & Customer */}
                      <div>
                        {rev.title && (
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                            {rev.title}
                          </h4>
                        )}
                        <p className="text-xs text-zinc-500 dark:text-white/60">
                          By <strong className="text-zinc-800 dark:text-zinc-200">{rev.customerName}</strong> ({rev.customerEmail}) • Product ID: <span className="font-mono">{rev.productId}</span>
                        </p>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                        {rev.content}
                      </p>

                      {/* Photos thumbnail gallery */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {rev.images.map((img) => (
                            <a
                              key={img.id}
                              href={img.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10"
                            >
                              <Image src={img.imageUrl} alt="Review attachment" fill className="object-cover" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Store Owner reply block */}
                      {rev.adminReply && (
                        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs">
                          <span className="font-bold text-emerald-600 dark:text-[#18C729]">
                            Store Owner Reply:
                          </span>{" "}
                          <span className="text-zinc-600 dark:text-zinc-300">{rev.adminReply}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-row md:flex-col items-end justify-center gap-2 shrink-0">
                    {rev.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(rev.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#18C729] hover:bg-[#15b024] transition-colors"
                      >
                        Approve
                      </button>
                    )}

                    {rev.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingReview(rev);
                          setRejectReason("");
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                      >
                        Reject
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setReplyingReview(rev);
                        setReplyText(rev.adminReply || "");
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 transition-colors"
                    >
                      {rev.adminReply ? "Edit Reply" : "Reply"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-white/10 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-white/10 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* REPLY MODAL */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#0c140f] border border-zinc-200 dark:border-white/10 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Store Owner Reply
            </h3>
            <p className="text-xs text-zinc-500">
              Replying to <strong>{replyingReview.customerName}</strong> on review for{" "}
              <span className="font-mono">{replyingReview.productId}</span>
            </p>

            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your public store response here..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-black/50 text-xs focus:outline-none focus:border-[#18C729]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReply}
                onClick={handleSaveReply}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#18C729] hover:bg-[#15b024] shadow-sm"
              >
                {isSubmittingReply ? "Saving..." : "Save Reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingReview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#0c140f] border border-zinc-200 dark:border-white/10 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Reject Review
            </h3>
            <p className="text-xs text-zinc-500">
              Are you sure you want to reject this review by <strong>{rejectingReview.customerName}</strong>?
            </p>

            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Optional rejection reason (internal notes)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-black/50 text-xs focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
