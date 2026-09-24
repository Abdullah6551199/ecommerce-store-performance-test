"use client";

import React, { useState } from "react";
import { SectionProps } from "@/lib/themes/types";
import RatingStars from "../blocks/RatingStars";
import Button from "../blocks/Button";

export interface ProductReviewsSectionSettings {
  heading?: string;
  reviews_app_id?: string;
  show_summary?: boolean;
  show_form?: boolean;
}

export default function ProductReviewsSection({
  settings = {},
  storeData,
}: SectionProps<ProductReviewsSectionSettings>) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const heading = settings.heading || "Customer Reviews";
  const showSummary = settings.show_summary !== false;
  const showForm = settings.show_form !== false;

  const mockReviews = [
    {
      id: "r1",
      author: "Alex Morgan",
      rating: 5,
      date: "2 days ago",
      title: "Phenomenal build quality!",
      body: "Exceeded all my expectations. The materials feel ultra-premium, assembly took 5 minutes, and support was lightning fast.",
    },
    {
      id: "r2",
      author: "Sarah Jenkins",
      rating: 5,
      date: "1 week ago",
      title: "Clean modern design",
      body: "Matches my setup seamlessly. The aesthetic is sleek and minimal without compromising on comfort. Worth every cent.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !comment) return;
    setSubmitted(true);
    setTimeout(() => {
      setShowReviewForm(false);
      setSubmitted(false);
      setAuthor("");
      setComment("");
    }, 2000);
  };

  return (
    <div className="w-full my-12 border-t border-[var(--theme-border,#E4E4E7)] pt-10 font-[family-name:var(--theme-font-body)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            {heading}
          </h2>
          {showSummary && (
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={4.9} showNumber />
              <span className="text-xs text-[var(--theme-text-muted,#71717A)]">
                Based on 24 verified reviews
              </span>
            </div>
          )}
        </div>

        {showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? "Cancel" : "Write a Review"}
          </Button>
        )}
      </div>

      {/* Review Form Drawer / Box */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmit}
          style={{ borderRadius: "var(--theme-radius, 8px)" }}
          className="mb-8 p-5 border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] space-y-4"
        >
          <h3 className="text-sm font-semibold text-[var(--theme-text,#18181B)]">
            Write Your Review
          </h3>

          <div>
            <label className="block text-xs font-medium text-[var(--theme-text-muted,#71717A)] mb-1">
              Your Rating
            </label>
            <div className="flex gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="cursor-pointer text-lg p-0.5"
                >
                  {s <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--theme-text-muted,#71717A)] mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 text-xs rounded border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--theme-text-muted,#71717A)] mb-1">
              Your Feedback
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love about this product?"
              className="w-full px-3 py-2 text-xs rounded border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)]"
            />
          </div>

          {submitted ? (
            <p className="text-xs font-semibold text-emerald-600">
              Thank you! Your review has been submitted.
            </p>
          ) : (
            <Button type="submit" size="sm" variant="primary">
              Submit Review
            </Button>
          )}
        </form>
      )}

      {/* Reviews list */}
      <div className="space-y-4 divide-y divide-[var(--theme-border,#E4E4E7)]">
        {mockReviews.map((rev) => (
          <div key={rev.id} className="pt-4 first:pt-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-[var(--theme-text,#18181B)]">
                {rev.author}
              </span>
              <span className="text-xs text-[var(--theme-text-muted,#71717A)]">
                {rev.date}
              </span>
            </div>
            <RatingStars rating={rev.rating} size="sm" />
            <h4 className="mt-2 text-xs font-bold text-[var(--theme-text,#18181B)]">
              {rev.title}
            </h4>
            <p className="mt-1 text-xs text-[var(--theme-text-muted,#71717A)] leading-relaxed">
              {rev.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
