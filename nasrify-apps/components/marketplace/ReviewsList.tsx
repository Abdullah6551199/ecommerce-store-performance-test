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
  reviews: MarketplaceReview[];
  currentUser: UserProfile | null;
  onReviewUpdated: () => void;
}

export function ReviewsList({ reviews, currentUser, onReviewUpdated }: Props) {
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Local state to track helpful votes immediately
  const [votedMap, setVotedMap] = useState<Record<string, { voted: boolean; count: number }>>({});

  async function handleToggleHelpful(reviewId: string, currentHelpful: number) {
    if (!currentUser) {
      alert("Please sign in to vote on reviews.");
      return;
    }

    try {
      const res = await fetch(`/api/marketplace/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        setVotedMap((prev) => ({
          ...prev,
          [reviewId]: { voted: data.voted, count: data.helpfulCount },
        }));
      }
    } catch {
      // non-fatal
    }
  }

  async function handleTeamRespond(reviewId: string) {
    if (!responseText.trim()) return;
    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/marketplace/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responseText }),
      });
      const data: any = await res.json();
      if (!res.ok || !data.success) {
        setActionError(data.error || "Failed to submit response");
      } else {
        setRespondingId(null);
        setResponseText("");
        onReviewUpdated();
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to submit response");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleHideReview(reviewId: string) {
    if (!confirm("Are you sure you want to hide this review from the public hub?")) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/marketplace/reviews/${reviewId}/hide`, {
        method: "POST",
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        onReviewUpdated();
      } else {
        alert(data.error || "Failed to hide review");
      }
    } catch {
      alert("Failed to hide review");
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(timestamp: number): string {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
        <div className="text-3xl mb-3">💬</div>
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
          No customer reviews yet
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Be the first to share your thoughts and help others make informed decisions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((rev) => {
        const voteState = votedMap[rev.id] ?? {
          voted: rev.userVote === "helpful",
          count: rev.helpfulCount,
        };

        const initial = (rev.userName || rev.userEmail || "U")[0].toUpperCase();

        return (
          <div
            key={rev.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            {/* Header: User Avatar, Name, Verified Badge, Date */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {initial}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      {rev.userName || "Verified User"}
                    </span>
                    {rev.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span>✓</span> Verified Install
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
              </div>

              {/* Stars display */}
              <div className="flex items-center gap-0.5 text-amber-400 text-sm">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s}>{rev.rating >= s ? "★" : "☆"}</span>
                ))}
              </div>
            </div>

            {/* Content: Title & Body */}
            <div className="mt-3.5 space-y-1.5">
              {rev.title && (
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {rev.title}
                </h4>
              )}
              {rev.body && (
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {rev.body}
                </p>
              )}
            </div>

            {/* Team Response bubble (Nasrify Team) */}
            {rev.teamResponse && (
              <div className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">
                      ⚡
                    </span>
                    <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      Nasrify Team
                    </span>
                  </div>
                  {rev.teamResponseAt && (
                    <span className="text-[10px] text-zinc-400">
                      {formatDate(rev.teamResponseAt)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {rev.teamResponse}
                </p>
              </div>
            )}

            {/* Footer: Helpful button & Team actions */}
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleHelpful(rev.id, rev.helpfulCount)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    voteState.voted
                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  <span>👍</span>
                  <span>Helpful ({voteState.count})</span>
                </button>
              </div>

              {/* Team moderation tools (Only for Nasrify Team) */}
              {currentUser?.isTeam && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRespondingId(respondingId === rev.id ? null : rev.id);
                      setResponseText(rev.teamResponse || "");
                      setActionError(null);
                    }}
                    className="px-2.5 py-1 rounded-lg font-bold text-[11px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer"
                  >
                    {rev.teamResponse ? "Edit Team Reply" : "Reply as Nasrify Team"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHideReview(rev.id)}
                    disabled={actionLoading}
                    className="px-2.5 py-1 rounded-lg font-bold text-[11px] text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    Hide
                  </button>
                </div>
              )}
            </div>

            {/* Inline Team reply composition box */}
            {respondingId === rev.id && (
              <div className="mt-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-purple-500/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Respond as Nasrify Team
                  </span>
                </div>
                {actionError && (
                  <p className="text-xs text-rose-500 font-medium mb-2">{actionError}</p>
                )}
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type an official Nasrify Team response..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setRespondingId(null)}
                    className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading || !responseText.trim()}
                    onClick={() => handleTeamRespond(rev.id)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? "Posting..." : "Post Reply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
