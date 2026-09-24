"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/themes/blocks/Button";
import Badge from "@/components/themes/blocks/Badge";

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
    <div className="space-y-6 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]">
      <div className="pb-2">
        <h1 className="text-2xl font-black text-[var(--theme-text,#18181B)] tracking-tight font-[family-name:var(--theme-font-heading)]">
          My Product Reviews
        </h1>
        <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-0.5">
          View, edit, or delete feedback and star ratings you submitted ({reviews.length} total)
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-[var(--theme-surface,#F4F4F5)] animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text-muted,#71717A)] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">No Reviews Yet</h3>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1 mb-6 max-w-sm mx-auto">
            Share your thoughts on products you purchased to guide fellow shoppers.
          </p>
          <Link href="/account/orders">
            <Button variant="primary" size="md">
              Review Past Orders &rarr;
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 sm:p-6 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-14 w-14 rounded-xl bg-[var(--theme-surface,#F4F4F5)] overflow-hidden border border-[var(--theme-border,#E4E4E7)] shrink-0">
                    {rev.productImage ? (
                      <Image
                        src={rev.productImage}
                        alt={rev.productName || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--theme-text-muted,#71717A)] text-xs font-bold">
                        ★
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/product/${rev.productSlug || rev.productId}`}
                      className="text-xs sm:text-sm font-extrabold text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] line-clamp-1 transition-colors"
                    >
                      {rev.productName || "Product Item"}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-400 text-xs">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>{star <= rev.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                      <span className="text-[11px] text-[var(--theme-text-muted,#71717A)]">
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
                  <Badge
                    text={rev.status}
                    variant={rev.status === "approved" ? "new" : "secondary"}
                    size="sm"
                  />

                  {rev.status === "pending" && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(rev)}
                        className="px-3 py-1 text-xs font-bold rounded-lg border border-[var(--theme-border,#E4E4E7)] text-[var(--theme-text,#18181B)] hover:border-[var(--theme-primary,#25D366)] transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Review"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {rev.title && (
                <h4 className="text-xs font-bold text-[var(--theme-text,#18181B)]">
                  {rev.title}
                </h4>
              )}

              <p className="text-xs text-[var(--theme-text-muted,#71717A)] leading-relaxed">
                {rev.content}
              </p>

              {rev.adminReply && (
                <div className="p-4 rounded-xl bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)] space-y-1">
                  <span className="text-[10px] font-black text-[var(--theme-primary,#25D366)] uppercase tracking-wider block">
                    Response from Store Concierge
                  </span>
                  <p className="text-xs text-[var(--theme-text,#18181B)] leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[var(--theme-border,#E4E4E7)] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border,#E4E4E7)]">
              <h3 className="text-base font-black text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                Edit Product Review
              </h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className={`text-xl cursor-pointer transition ${
                        star <= editRating ? "text-amber-400" : "text-[var(--theme-border,#E4E4E7)]"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[var(--theme-text,#18181B)] ml-2">
                    {editRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">Headline (Optional)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)] focus:outline-none focus:border-[var(--theme-primary,#25D366)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">Your Feedback</label>
                <textarea
                  rows={4}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)] focus:outline-none focus:border-[var(--theme-primary,#25D366)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingReview(null)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
