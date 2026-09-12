"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ReviewImage {
  id: string;
  imageUrl: string;
}

interface ReviewItem {
  id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string | null;
  content: string;
  isVerifiedPurchase: number;
  helpfulCount: number;
  notHelpfulCount: number;
  adminReply: string | null;
  adminReplyAt: string | null;
  createdAt: string;
  images: ReviewImage[];
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  breakdown: Array<{ stars: number; count: number; percentage: number }>;
}

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export default function ProductReviewsSection({
  productId,
  productName,
}: ProductReviewsSectionProps): React.JSX.Element {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<RatingSummary>({
    averageRating: 0,
    totalReviews: 0,
    breakdown: [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: 0, percentage: 0 })),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Sort
  const [sort, setSort] = useState<"recent" | "helpful" | "highest" | "lowest">("recent");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [pageOffset, setPageOffset] = useState(0);
  const limit = 6;

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Voting State Tracking (ReviewId -> 'helpful' | 'not_helpful')
  const [votedMap, setVotedMap] = useState<Record<string, "helpful" | "not_helpful">>({});

  // Image Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Fetch reviews
  const fetchReviews = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      const currentOffset = reset ? 0 : pageOffset;
      const params = new URLSearchParams({
        sort,
        limit: String(limit),
        offset: String(currentOffset),
      });
      if (selectedRating !== null) {
        params.set("rating", String(selectedRating));
      }

      const res = await fetch(`/api/products/${productId}/reviews?${params.toString()}`);
      const json = (await res.json()) as any;

      if (json.success && json.data) {
        if (reset || currentOffset === 0) {
          setReviews(json.data.reviews || []);
        } else {
          setReviews((prev) => [...prev, ...(json.data.reviews || [])]);
        }
        setTotal(json.data.total || 0);
        if (json.data.summary) {
          setSummary(json.data.summary);
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, sort, selectedRating, pageOffset]);

  useEffect(() => {
    setPageOffset(0);
    fetchReviews(true);
  }, [sort, selectedRating]);

  // Handle Load More
  const handleLoadMore = () => {
    const nextOffset = pageOffset + limit;
    setPageOffset(nextOffset);
    // Trigger fetch for next offset
    (async () => {
      try {
        const params = new URLSearchParams({
          sort,
          limit: String(limit),
          offset: String(nextOffset),
        });
        if (selectedRating !== null) {
          params.set("rating", String(selectedRating));
        }
        const res = await fetch(`/api/products/${productId}/reviews?${params.toString()}`);
        const json = (await res.json()) as any;
        if (json.success && json.data?.reviews) {
          setReviews((prev) => [...prev, ...json.data.reviews]);
        }
      } catch (err) {
        console.error("Error loading more:", err);
      }
    })();
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      setErrorMessage("You can upload a maximum of 5 images.");
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/reviews/upload", {
          method: "POST",
          body: formData,
        });
        const json = (await res.json()) as any;
        if (json.success && json.data?.url) {
          setUploadedImages((prev) => [...prev, json.data.url]);
        } else {
          setErrorMessage(json.error || "Failed to upload image.");
        }
      }
    } catch (err) {
      setErrorMessage("Network error during photo upload.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formContent.trim()) {
      setErrorMessage("Please complete all required fields (Name, Email, Rating, Review).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmissionMessage(null);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formName.trim(),
          customerEmail: formEmail.trim(),
          rating: formRating,
          title: formTitle.trim() || null,
          content: formContent.trim(),
          images: uploadedImages,
        }),
      });

      const json = (await res.json()) as any;

      if (json.success) {
        setSubmissionMessage(
          json.message || "Thank you! Your review is pending approval."
        );
        // Reset form
        setFormTitle("");
        setFormContent("");
        setUploadedImages([]);
        // Keep form open with confirmation, or re-fetch reviews
        fetchReviews(true);
      } else {
        setErrorMessage(json.error || "Failed to submit review.");
      }
    } catch (err) {
      setErrorMessage("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpful Voting Handler
  const handleVote = async (reviewId: string, voteType: "helpful" | "not_helpful") => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      const json = (await res.json()) as any;

      if (json.success && json.data) {
        setVotedMap((prev) => ({ ...prev, [reviewId]: voteType }));
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpfulCount: json.data.helpfulCount,
                  notHelpfulCount: json.data.notHelpfulCount,
                }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const ratingDescriptions = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <section className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-[#0c140f]/60 p-6 sm:p-8 backdrop-blur-md shadow-xl dark:shadow-none space-y-8">
      {/* SECTION HEADER & RATING SUMMARY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-400">★</span> Customer Reviews & Ratings
          </h2>
          <p className="text-xs text-zinc-500 dark:text-white/60 mt-1">
            Real feedback and verified buyer impressions for {productName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setSubmissionMessage(null);
            setErrorMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#18C729] hover:bg-[#15b024] active:scale-95 transition-all shadow-md shadow-emerald-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {showForm ? "Close Form" : "Write a Review"}
        </button>
      </div>

      {/* RATING BREAKDOWN CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/5">
        {/* Left: Big Average */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/10 pb-6 md:pb-0 md:pr-6">
          <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "0.0"}
          </span>
          <div className="flex items-center gap-1 text-amber-400 text-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= Math.round(summary.averageRating) ? "★" : "☆"}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-zinc-500 dark:text-white/60">
            Based on {summary.totalReviews} {summary.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Center: Rating Breakdown Progress Bars */}
        <div className="md:col-span-2 space-y-2.5">
          {summary.breakdown.map((item) => (
            <button
              key={item.stars}
              type="button"
              onClick={() => setSelectedRating(selectedRating === item.stars ? null : item.stars)}
              className={`w-full flex items-center gap-3 text-xs group cursor-pointer p-1 rounded-lg transition-colors ${
                selectedRating === item.stars ? "bg-emerald-500/10 dark:bg-emerald-500/20" : "hover:bg-zinc-100 dark:hover:bg-white/5"
              }`}
            >
              <span className="w-12 font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-end gap-1">
                {item.stars} <span className="text-amber-400">★</span>
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 group-hover:bg-[#18C729] transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-10 text-right text-zinc-500 dark:text-white/50 font-mono text-[11px]">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* WRITE A REVIEW FORM DRAWER / MODAL */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Write Your Review
            </h3>
            <span className="text-xs text-zinc-500 dark:text-white/60">
              * Required fields
            </span>
          </div>

          {submissionMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{submissionMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-2xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setFormRating(star)}
                    className="text-amber-400 hover:scale-125 transition-transform"
                    aria-label={`${star} Stars`}
                  >
                    {star <= (hoverRating || formRating) ? "★" : "☆"}
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-2">
                {ratingDescriptions[(hoverRating || formRating) - 1]}
              </span>
            </div>
          </div>

          {/* Name & Email Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ahmed Khan"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-black/50 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-[#18C729]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Your Email * (used for Verified Purchase badge)
              </label>
              <input
                type="email"
                required
                placeholder="e.g. ahmed@example.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-black/50 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-[#18C729]"
              />
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Review Title (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Highly recommend for daily training"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-black/50 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-[#18C729]"
            />
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Review Details *
            </label>
            <textarea
              required
              rows={4}
              placeholder="What did you like or dislike? How is the fit and performance?"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-black/50 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-[#18C729] resize-y"
            />
          </div>

          {/* Image Upload (Max 5 images to R2) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Add Photos (Max 5 photos)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {uploadedImages.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-300 dark:border-white/20 group">
                  <Image src={url} alt={`Upload preview ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {uploadedImages.length < 5 && (
                <label className="w-16 h-16 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-white/20 hover:border-[#18C729] cursor-pointer text-zinc-500 dark:text-white/50 hover:text-[#18C729] transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[9px] font-mono mt-0.5">
                    {isUploadingImage ? "..." : "Photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingImage}
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#18C729] hover:bg-[#15b024] disabled:opacity-50 transition-all shadow-md"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {/* FILTER PILLS & SORT SELECT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Rating Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedRating(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedRating === null
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(selectedRating === star ? null : star)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                selectedRating === star
                  ? "bg-amber-400 text-black font-semibold shadow-sm"
                  : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
              }`}
            >
              {star} <span className="text-amber-500">★</span>
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-white/50">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-black/50 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#18C729]"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {isLoading && reviews.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500 dark:text-white/50 font-mono">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center space-y-2 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-dashed border-zinc-300 dark:border-white/10">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No reviews found matching your filter.
            </p>
            <p className="text-xs text-zinc-500 dark:text-white/50">
              Be the first to share your thoughts on this product!
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const hasVoted = votedMap[rev.id];
            const dateStr = new Date(rev.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={rev.id}
                className="p-5 rounded-2xl border border-zinc-200/90 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm space-y-3"
              >
                {/* Header: Author & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Initials Avatar */}
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#18C729] font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                      {rev.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          {rev.customerName}
                        </span>
                        {rev.isVerifiedPurchase === 1 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold border border-emerald-500/20">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-white/40">
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s}>{s <= rev.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                </div>

                {/* Review Title & Content */}
                <div className="space-y-1.5">
                  {rev.title && (
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {rev.content}
                  </p>
                </div>

                {/* Review Images */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rev.images.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setLightboxImage(img.imageUrl)}
                        className="relative w-14 h-14 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 hover:border-[#18C729] transition-colors"
                      >
                        <Image src={img.imageUrl} alt="Customer review photo" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Store Owner / Admin Reply */}
                {rev.adminReply && (
                  <div className="mt-3 p-3.5 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-[#18C729]">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Store Owner Response
                      </span>
                      {rev.adminReplyAt && (
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {new Date(rev.adminReplyAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 pl-5">
                      {rev.adminReply}
                    </p>
                  </div>
                )}

                {/* Helpful Voting Buttons */}
                <div className="pt-2 border-t border-zinc-200/60 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500 dark:text-white/50">
                  <span>Was this review helpful?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVote(rev.id, "helpful")}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                        hasVoted === "helpful"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "border-zinc-200 dark:border-white/10 hover:border-zinc-400 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>Yes ({rev.helpfulCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVote(rev.id, "not_helpful")}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                        hasVoted === "not_helpful"
                          ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 font-semibold"
                          : "border-zinc-200 dark:border-white/10 hover:border-zinc-400 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.766 1.042m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                      <span>No ({rev.notHelpfulCount})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Load More Button */}
        {reviews.length < total && (
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl border border-zinc-300 dark:border-white/10 text-xs font-semibold text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
            >
              {isLoading ? "Loading..." : `Load More Reviews (${total - reviews.length} remaining)`}
            </button>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <Image
              src={lightboxImage}
              alt="Expanded customer photo"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white bg-black/60 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
