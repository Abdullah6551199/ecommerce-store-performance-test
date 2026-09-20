"use client";

import { useState } from "react";
import type { MarketplaceListing } from "@/types/marketplace";

interface Props {
  initialPending: MarketplaceListing[];
  isSuperAdmin: boolean;
  userEmail: string | null;
}

export function SuperPendingClient({ initialPending, isSuperAdmin, userEmail }: Props) {
  const [pending, setPending] = useState<MarketplaceListing[]>(initialPending);
  const [selectedApp, setSelectedApp] = useState<MarketplaceListing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl mx-auto mb-3 font-bold">
            🔒
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Nasrify Team Access Required
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
            {userEmail
              ? `Your account (${userEmail}) is not authorized to access the Nasrify Team approval queue.`
              : "You must be signed in with a Nasrify Team account to review pending apps."}
          </p>
          <a
            href="/developer"
            className="inline-flex px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            Sign In with Nasrify Team Credentials
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
        text: `App ${action === "approve" ? "approved & published live" : action === "reject" ? "rejected" : "delisted"}!`,
      });

      // Remove from pending list
      setPending((prev) => prev.filter((item) => item.id !== listingId));
      setSelectedApp(null);
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
            <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Nasrify Team
            </span>
            <span className="text-xs text-zinc-400">• Authenticated as {userEmail}</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            App Marketplace Approval Queue
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Review pending developer submissions, verify manifests, and grant marketplace distribution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {pending.length} Pending Nasrify Team Review{pending.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Queue List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Submissions Awaiting Approval
          </h2>

          {pending.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto mb-3">
                ✓
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Queue is Clear!
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                There are no pending app submissions awaiting review right now.
              </p>
            </div>
          ) : (
            pending.map((app) => (
              <div
                key={app.id}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedApp?.id === app.id
                    ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-xl flex-shrink-0">
                      {app.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={app.iconUrl} alt={app.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span>⚡</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white text-base">
                          {app.name}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          v{app.version}
                        </span>
                        <span className="text-xs capitalize px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {app.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        By <span className="font-medium text-zinc-700 dark:text-zinc-300">{app.author}</span> ({app.submittedBy})
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Pending
                    </span>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-3 pl-15">
                  {app.description}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Review & Inspector Panel */}
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4">
            Submission Inspector
          </h2>

          {!selectedApp ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 text-xs shadow-sm">
              Select an app submission from the queue to inspect details and take review action.
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">
                  Inspecting Submission
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {selectedApp.name}
                </h3>
                <div className="text-xs font-mono text-zinc-500 mt-0.5">
                  app_id: {selectedApp.appId} • v{selectedApp.version}
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-2 text-xs border-y border-zinc-100 dark:border-zinc-800 py-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Developer:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedApp.submittedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Category:</span>
                  <span className="capitalize font-semibold text-zinc-800 dark:text-zinc-200">{selectedApp.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Pricing Model:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedApp.pricing === "paid" && selectedApp.price ? `$${selectedApp.price}` : "Free"}
                  </span>
                </div>
              </div>

              {/* Manifest Viewer */}
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white mb-1.5 flex items-center justify-between">
                  <span>App Manifest (Security Audit)</span>
                  <span className="text-[10px] text-zinc-400">JSON</span>
                </div>
                <pre className="p-3 bg-zinc-950 rounded-xl text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48 border border-zinc-800">
                  {selectedApp.manifestJson || "// No manifest JSON provided"}
                </pre>
              </div>

              {/* Full Description */}
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
                  Description
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                  {selectedApp.description}
                </p>
              </div>

              {/* Rejection input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Rejection Reason (if rejecting)
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this submission was rejected..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Review Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  id="approve-app-btn"
                  disabled={actionLoading}
                  onClick={() => handleReview(selectedApp.id, "approve")}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  ✓ Approve & Publish to Marketplace
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="reject-app-btn"
                    disabled={actionLoading}
                    onClick={() => handleReview(selectedApp.id, "reject")}
                    className="py-2.5 px-3 rounded-xl font-semibold text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-50 transition-colors"
                  >
                    Reject Submission
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleReview(selectedApp.id, "delist")}
                    className="py-2.5 px-3 rounded-xl font-semibold text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors"
                  >
                    Delist App
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
