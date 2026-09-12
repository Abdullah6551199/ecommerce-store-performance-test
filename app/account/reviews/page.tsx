"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface CustomerReview {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  productImage: string | null;
  rating: number;
  title: string | null;
  content: string;
  status: "pending" | "approved" | "rejected";
  adminReply: string | null;
  adminReplyAt: string | null;
  createdAt: string;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "rejected":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
}

export default function AccountReviewsPage(): React.JSX.Element {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/customer/reviews");
      if (res.ok) {
        const data = (await res.json()) as { reviews?: CustomerReview[] };
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openEditModal = (rev: CustomerReview) => {
    setEditingReview(rev);
    setEditRating(rev.rating);
    setEditTitle(rev.title || "");
    setEditContent(rev.content);
    setFormError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/customer/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editRating,
          title: editTitle || null,
          content: editContent,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to update review");
      }

      setEditingReview(null);
      fetchReviews();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error updating review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetch(`/api/customer/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete review error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          My Product Reviews
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          View and manage the feedback and ratings you submitted
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-zinc-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No Reviews Yet</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Share your experience on purchased products to help other shoppers!
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#18C729] text-black font-bold text-xs hover:bg-[#15af24]"
          >
            Check Orders to Review &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-white/5 relative overflow-hidden shrink-0 border border-zinc-200 dark:border-white/10">
                    {rev.productImage ? (
                      <Image
                        src={rev.productImage}
                        alt={rev.productName || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-400">
                        N/A
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/product/${rev.productSlug || rev.productId}`}
                      className="text-xs font-bold text-zinc-900 dark:text-white hover:text-[#18C729]"
                    >
                      {rev.productName || "Product"}
                    </Link>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
                      {"★".repeat(rev.rating)}
                      <span className="text-zinc-400">{"☆".repeat(5 - rev.rating)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                      rev.status
                    )}`}
                  >
                    {rev.status}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                {rev.title && (
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white mb-1">
                    {rev.title}
                  </h4>
                )}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {rev.content}
                </p>
              </div>

              {rev.adminReply && (
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs">
                  <span className="font-bold text-emerald-600 dark:text-[#18C729] block mb-1">
                    Store Response:
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400">{rev.adminReply}</p>
                </div>
              )}

              {/* Actions: edit/delete only if pending */}
              {rev.status === "pending" && (
                <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-end gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => openEditModal(rev)}
                    className="font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                  >
                    Edit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id)}
                    className="font-bold text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140e] p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                Edit Pending Review
              </h2>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Star Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setEditRating(star)}
                      className={`text-xl ${star <= editRating ? "text-amber-500" : "text-zinc-300 dark:text-zinc-700"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Great product!"
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Review Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Share your detailed feedback..."
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#18C729] text-black font-extrabold text-xs hover:bg-[#15af24] shadow-md shadow-[#18C729]/20 transition disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
