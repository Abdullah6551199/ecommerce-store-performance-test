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

function getReviewStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return "bg-purple-100 text-[#960DF2] dark:bg-purple-900/60 dark:text-[#EACFFC] border-purple-300 dark:border-purple-700";
    case "rejected":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    default:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
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
      <div className="pb-2">
        <h1 className="text-2xl font-black text-[#3C0561] dark:text-white tracking-tight">
          My Product Reviews
        </h1>
        <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-0.5">
          View, edit, or delete feedback and star ratings you submitted ({reviews.length} total)
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-purple-100/50 dark:bg-purple-950/40 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[#3C0561] dark:text-white">No Reviews Yet</h3>
          <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1 mb-6 max-w-sm mx-auto">
            Share your thoughts on products you purchased to guide fellow athletes and shoppers.
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Review Past Orders &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 overflow-hidden border border-purple-100 dark:border-purple-800 shrink-0">
                    {rev.productImage ? (
                      <Image
                        src={rev.productImage}
                        alt={rev.productName || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-purple-400 text-xs font-bold">
                        ★
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/product/${rev.productSlug || rev.productId}`}
                      className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white hover:text-[#960DF2] dark:hover:text-[#EACFFC] line-clamp-1"
                    >
                      {rev.productName || "Product Item"}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-400 text-xs">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>{star <= rev.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getReviewStatusBadge(
                      rev.status
                    )}`}
                  >
                    {rev.status}
                  </span>

                  {rev.status === "pending" && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(rev)}
                        className="px-3 py-1 text-xs font-bold rounded-lg border border-purple-200 dark:border-purple-800 text-[#960DF2] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-900/40 transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                        title="Delete Review"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {rev.title && (
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {rev.title}
                </h4>
              )}

              <p className="text-xs text-slate-600 dark:text-purple-200/80 leading-relaxed">
                {rev.content}
              </p>

              {rev.adminReply && (
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-[#2A0344]/50 border border-purple-100 dark:border-purple-800/60 space-y-1">
                  <span className="text-[10px] font-black text-[#960DF2] dark:text-[#EACFFC] uppercase tracking-wider block">
                    Response from ApexStore Concierge
                  </span>
                  <p className="text-xs text-slate-700 dark:text-purple-200/90 leading-relaxed">
                    {rev.adminReply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1E0230] border border-purple-200 dark:border-purple-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-900/40">
              <h3 className="text-base font-black text-[#3C0561] dark:text-white">Edit Your Review</h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1.5">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        star <= editRating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1.5">Headline (Optional)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Great lightweight feel!"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#960DF2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1.5">Your Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#960DF2] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-900/40 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-[#960DF2] hover:bg-[#850bd8] text-white rounded-xl shadow-md shadow-purple-500/20 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Update Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
