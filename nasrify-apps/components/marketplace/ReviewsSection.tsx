"use client";

import React, { useState, useEffect } from "react";
import type { MarketplaceReview, RatingSummary as RatingSummaryType } from "@/types/marketplace";
import { RatingSummary } from "./RatingSummary";
import { ReviewForm } from "./ReviewForm";
import { ReviewsList } from "./ReviewsList";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  isTeam: boolean;
}

interface Props {
  listingType: "app" | "theme";
  listingId: string;
  initialSummary: RatingSummaryType;
  initialReviews: MarketplaceReview[];
  initialUser: UserProfile | null;
}

export function ReviewsSection({
  listingType,
  listingId,
  initialSummary,
  initialReviews,
  initialUser,
}: Props) {
  const [summary, setSummary] = useState<RatingSummaryType>(initialSummary);
  const [reviews, setReviews] = useState<MarketplaceReview[]>(initialReviews);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(initialUser);

  // If user wasn't passed initially, try fetching /api/marketplace/auth/me
  useEffect(() => {
    if (!currentUser) {
      fetch("/api/marketplace/auth/me")
        .then((res) => res.json())
        .then((data: any) => {
          if (data?.success && data?.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  async function reloadReviewsAndSummary() {
    try {
      const [sumRes, revRes] = await Promise.all([
        fetch(`/api/marketplace/reviews/summary?type=${listingType}&listingId=${listingId}`),
        fetch(`/api/marketplace/reviews?type=${listingType}&listingId=${listingId}&page=1`),
      ]);

      const sumData: any = await sumRes.json();
      const revData: any = await revRes.json();

      if (sumData?.success && sumData?.summary) {
        setSummary(sumData.summary);
      }
      if (revData?.success && revData?.reviews) {
        setReviews(revData.reviews);
      }
    } catch {
      // non-fatal
    }
  }

  const userReview = currentUser
    ? reviews.find((r) => r.userId === currentUser.id) || null
    : null;

  return (
    <div id="reviews-section" className="scroll-mt-24 space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Ratings &amp; Reviews
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real feedback from verified store merchants and developers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            {summary.totalReviews} {summary.totalReviews === 1 ? "Review" : "Reviews"}
          </span>
        </div>
      </div>

      {/* Summary Scorecard */}
      <RatingSummary summary={summary} />

      {/* Form at top of reviews section */}
      <ReviewForm
        listingType={listingType}
        listingId={listingId}
        currentUser={currentUser}
        existingReview={userReview}
        onReviewSubmitted={reloadReviewsAndSummary}
        onReviewDeleted={reloadReviewsAndSummary}
        onUserLoginSuccess={(u) => {
          setCurrentUser(u);
          reloadReviewsAndSummary();
        }}
      />

      {/* List of Reviews */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-zinc-400">
          Community Reviews
        </h3>
        <ReviewsList
          reviews={reviews}
          currentUser={currentUser}
          onReviewUpdated={reloadReviewsAndSummary}
        />
      </div>
    </div>
  );
}
