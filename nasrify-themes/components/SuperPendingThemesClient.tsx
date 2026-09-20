"use client";

import React, { useState } from "react";
import type { ThemeMarketplaceListing } from "@/types/themes";
import { ThemeMockupPreview } from "./ThemeMockupPreview";

interface SuperPendingThemesClientProps {
  initialPending: ThemeMarketplaceListing[];
  isSuperAdmin: boolean;
  userEmail: string | null;
}

export function SuperPendingThemesClient({
  initialPending,
  isSuperAdmin,
  userEmail,
}: SuperPendingThemesClientProps): React.JSX.Element {
  const [pending, setPending] = useState<ThemeMarketplaceListing[]>(initialPending);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMarketplaceListing | null>(null);
  const [previewTheme, setPreviewTheme] = useState<ThemeMarketplaceListing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl mx-auto mb-3 font-bold">
            🔒
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Super Admin Access Required
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
            {userEmail
              ? `Your account (${userEmail}) is not authorized to access the Super Admin theme approval queue.`
              : "You must be signed in with a Super Admin account to review pending theme submissions."}
          </p>
          <a
            href="/developer"
            className="inline-flex px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-sm"
          >
            Sign In with Super Admin Credentials
          </a>
        </div>
      </div>
    );
  }

  async function handleReview(listingId: string, action: "approve" | "reject" | "delist") {
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/super/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          action,
          rejectionReason: action === "reject" ? rejectionReason : undefined,
        }),
      });

      const data: any = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Review action failed");
      }

      setFeedback({
        type: "success",
        text: `Theme successfully ${
          action === "approve" ? "approved and published live" : action === "reject" ? "rejected" : "delisted"
        }!`,
      });

      setPending((prev) => prev.filter((item) => item.id !== listingId));
      setSelectedTheme(null);
      setRejectionReason("");
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Failed to process review action",
      });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Super Admin
            </span>
            <span className="text-xs text-zinc-400 font-mono">• Authenticated as {userEmail}</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            Themes Hub Approval Queue
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Review design tokens, inspect live storefront previews, verify mobile compatibility, and approve theme releases.
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-zinc-900 dark:text-white">
            {pending.length}
          </span>
          <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Pending Submissions
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pending List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Queue ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">
                Queue is clear!
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                All submitted themes have been reviewed.
              </p>
            </div>
          ) : (
            pending.map((theme) => {
              const isSelected = selectedTheme?.id === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    setSelectedTheme(theme);
                    setRejectionReason("");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-50 dark:bg-purple-950/30 border-purple-500 dark:border-purple-500 shadow-md"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-zinc-900 dark:text-white truncate">
                      {theme.name}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      v{theme.version}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>by {theme.author}</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {theme.category}
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] text-zinc-400 flex items-center justify-between">
                    <span>ID: {theme.themeId}</span>
                    <span>Submitted by {theme.submittedBy}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detail & Review Actions */}
        <div className="lg:col-span-7">
          {selectedTheme ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      {selectedTheme.themeId}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Pending Review
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                    {selectedTheme.name}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Submitted by {selectedTheme.submittedBy} &bull; v{selectedTheme.version}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewTheme(selectedTheme)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#960DF2] hover:bg-[#780AC2] shadow-sm flex items-center gap-1.5"
                >
                  <span>👁️</span>
                  <span>Inspect Live Mockup</span>
                </button>
              </div>

              {/* Description & Changelog */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Description:
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                    {selectedTheme.description || "No description provided."}
                  </p>
                </div>

                {selectedTheme.changelog && (
                  <div>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Changelog:
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px] bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                      {selectedTheme.changelog}
                    </p>
                  </div>
                )}
              </div>

              {/* Config JSON Inspector */}
              <div>
                <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 block mb-1">
                  Theme Config JSON (Design Tokens):
                </span>
                <pre className="p-3.5 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-[11px] max-h-48 overflow-y-auto border border-zinc-800">
                  {selectedTheme.configJson || "{}"}
                </pre>
              </div>

              {/* Review Actions */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Take Decision
                </h3>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (required if rejecting)..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleReview(selectedTheme.id, "approve")}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? "Processing..." : "✓ Approve & Publish Live"}
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading || !rejectionReason.trim()}
                    onClick={() => handleReview(selectedTheme.id, "reject")}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    ✕ Reject Submission
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 text-xs">
              Select a theme submission from the queue to review details and take an approval decision.
            </div>
          )}
        </div>
      </div>

      {/* Mockup Preview Modal */}
      {previewTheme && (
        <ThemeMockupPreview
          theme={previewTheme}
          isModal={true}
          onClose={() => setPreviewTheme(null)}
        />
      )}
    </div>
  );
}

export default SuperPendingThemesClient;
