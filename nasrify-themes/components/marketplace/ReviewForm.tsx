"use client";

import React, { useState } from "react";
import type { MarketplaceReview } from "@/types/marketplace";

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
  currentUser: UserProfile | null;
  existingReview: MarketplaceReview | null;
  onReviewSubmitted: () => void;
  onReviewDeleted: () => void;
  onUserLoginSuccess: (user: UserProfile) => void;
}

export function ReviewForm({
  listingType,
  listingId,
  currentUser,
  existingReview,
  onReviewSubmitted,
  onReviewDeleted,
  onUserLoginSuccess,
}: Props) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState<string>(existingReview?.title || "");
  const [body, setBody] = useState<string>(existingReview?.body || "");
  const [isEditing, setIsEditing] = useState<boolean>(!existingReview);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Quick Login state for unauthenticated users
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/marketplace/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data: any = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || "Login failed");
      } else {
        onUserLoginSuccess(data.user);
        setShowLogin(false);
      }
    } catch (err: any) {
      setLoginError(err?.message || "Failed to log in");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (existingReview) {
        // Edit own review
        const res = await fetch(`/api/marketplace/reviews/${existingReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, title, body }),
        });
        const data: any = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Failed to update review");
        } else {
          setSuccess("Your review has been updated!");
          setIsEditing(false);
          onReviewSubmitted();
        }
      } else {
        // Create new review
        const res = await fetch("/api/marketplace/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingType,
            listingId,
            rating,
            title,
            body,
          }),
        });
        const data: any = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Failed to post review");
        } else {
          setSuccess("Thank you! Your review has been posted.");
          setIsEditing(false);
          onReviewSubmitted();
        }
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!existingReview) return;
    if (!confirm("Are you sure you want to delete your review?")) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/marketplace/reviews/${existingReview.id}`, {
        method: "DELETE",
      });
      const data: any = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to delete review");
      } else {
        setSuccess("Your review has been deleted.");
        setIsEditing(true);
        setTitle("");
        setBody("");
        setRating(5);
        onReviewDeleted();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete review");
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-6 text-center">
        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg mx-auto mb-3 font-bold">
          ✍️
        </div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          Sign in to leave a review
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Share your experience with the community. Customer and developer accounts are welcome.
        </p>

        {!showLogin ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors cursor-pointer"
            >
              Sign In to Review
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="mt-5 max-w-xs mx-auto space-y-3 text-left">
            {loginError && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={loginLoading}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer text-center"
              >
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (existingReview && !isEditing) {
    return (
      <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
                Your Review
              </span>
              <div className="text-amber-400 text-sm">
                {"★".repeat(existingReview.rating)}
                {"☆".repeat(5 - existingReview.rating)}
              </div>
            </div>
            {existingReview.title && (
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-2">
                {existingReview.title}
              </h4>
            )}
            {existingReview.body && (
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                {existingReview.body}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setRating(existingReview.rating);
                setTitle(existingReview.title || "");
                setBody(existingReview.body || "");
                setIsEditing(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            {existingReview ? "Edit Your Review" : "Write a Review"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Signed in as <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentUser.name}</span> ({currentUser.email})
          </p>
        </div>
        {existingReview && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            {success}
          </div>
        )}

        {/* 5-Star Selector */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Rating <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating !== null ? hoverRating : rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="text-2xl sm:text-3xl text-amber-400 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                >
                  {active ? "★" : "☆"}
                </button>
              );
            })}
            <span className="text-xs font-bold text-zinc-500 ml-2">
              {rating} of 5 stars
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Review Title (optional)
          </label>
          <input
            type="text"
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience in one sentence"
            className="w-full px-4 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Review Details
            </label>
            <span className="text-[10px] text-zinc-400">
              {body.length} / 1000 chars
            </span>
          </div>
          <textarea
            rows={4}
            maxLength={1000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you like or dislike? How does it help your storefront design?"
            className="w-full px-4 py-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {existingReview && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
            >
              Delete Review
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Submitting..." : existingReview ? "Update Review" : "Post Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
