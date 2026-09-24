"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { ProductQuestion, QuestionStatus } from "../shared/types";

interface Props {
  initialProductId?: string;
}

export default function ProductQAManager({ initialProductId }: Props): React.JSX.Element {
  const [questions, setQuestions] = useState<Array<ProductQuestion & { productName?: string }>>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<QuestionStatus | "all">("all");
  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [answeringQuestion, setAnsweringQuestion] = useState<(ProductQuestion & { productName?: string }) | null>(null);
  const [adminAnswerText, setAdminAnswerText] = useState<string>("");
  const [adminAuthorName, setAdminAuthorName] = useState<string>("Nasrify Team");
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (initialProductId) params.set("productId", initialProductId);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/admin/apps/product-qa/list?${params.toString()}`);
      const json = (await res.json().catch(() => ({}))) as Record<string, any>;

      if (json.success && json.data) {
        setQuestions(json.data.questions || []);
        setTotal(json.data.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeTab, initialProductId, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleUpdateStatus = async (id: string, status: QuestionStatus) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/apps/product-qa/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status } : q))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/apps/product-qa/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned: !currentPinned }),
      });
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, isPinned: !currentPinned } : q))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question and all its answers?")) return;
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/apps/product-qa/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setTotal((t) => Math.max(0, t - 1));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: "publish" | "hide" | "delete") => {
    if (selectedIds.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selectedIds.size} selected questions?`)) return;

    setActionLoading("bulk");
    const ids = Array.from(selectedIds);
    try {
      if (action === "delete") {
        await fetch("/api/admin/apps/product-qa/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
      } else {
        const targetStatus: QuestionStatus = action === "publish" ? "published" : "hidden";
        for (const id of ids) {
          await fetch("/api/admin/apps/product-qa/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: targetStatus }),
          });
        }
      }
      setSelectedIds(new Set());
      await fetchQuestions();
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSubmitAdminAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringQuestion || !adminAnswerText.trim()) return;

    setSubmittingAnswer(true);
    setModalError(null);

    try {
      const res = await fetch("/api/admin/apps/product-qa/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: answeringQuestion.id,
          answer: adminAnswerText.trim(),
          authorName: adminAuthorName.trim() || "Nasrify Team",
          authorType: "nasrify_team",
        }),
      });

      const json = (await res.json().catch(() => ({}))) as Record<string, any>;
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to post answer");
      }

      // Automatically publish question if pending
      if (answeringQuestion.status === "pending") {
        await handleUpdateStatus(answeringQuestion.id, "published");
      }

      setAnsweringQuestion(null);
      setAdminAnswerText("");
      await fetchQuestions();
    } catch (err: any) {
      setModalError(err.message || "Failed to submit answer");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const formatDate = (ts?: number | null) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>💬</span> Product Q&amp;A Manager
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage customer inquiries, post official answers, and moderate community questions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search questions, askers, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366] w-64"
          />
        </div>
      </div>

      {/* Tabs & Bulk Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: "all", label: "All Questions" },
              { id: "pending", label: "Pending Review" },
              { id: "published", label: "Published" },
              { id: "hidden", label: "Hidden" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIds(new Set());
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#25D366] text-white shadow-md shadow-[#25D366]/20"
                  : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{selectedIds.size} selected:</span>
            <button
              type="button"
              disabled={actionLoading === "bulk"}
              onClick={() => handleBulkAction("publish")}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
            >
              Publish
            </button>
            <button
              type="button"
              disabled={actionLoading === "bulk"}
              onClick={() => handleBulkAction("hide")}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-600 text-white hover:bg-zinc-700 cursor-pointer"
            >
              Hide
            </button>
            <button
              type="button"
              disabled={actionLoading === "bulk"}
              onClick={() => handleBulkAction("delete")}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1EA855] border-t-transparent" />
            <p className="mt-2 text-xs text-zinc-500">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center p-6">
            <span className="text-3xl block mb-2">💬</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No questions found</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              There are no questions matching the current filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/5 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === questions.length && questions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-zinc-300 text-[#25D366] focus:ring-[#25D366]"
                    />
                  </th>
                  <th className="p-3">Question &amp; Asker</th>
                  <th className="p-3">Product</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Answers</th>
                  <th className="p-3 text-center">Upvotes</th>
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                {questions.map((q) => {
                  const isSelected = selectedIds.has(q.id);
                  const isBusy = actionLoading === q.id;

                  return (
                    <tr
                      key={q.id}
                      className={`hover:bg-zinc-50/70 dark:hover:bg-white/5 transition-colors ${
                        isSelected ? "bg-[#F4F4F5]/40 dark:bg-[#18181B]/20" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(q.id)}
                          className="rounded border-zinc-300 text-[#25D366] focus:ring-[#25D366]"
                        />
                      </td>

                      <td className="p-3 max-w-sm">
                        <div className="flex items-start gap-1.5">
                          {q.isPinned && (
                            <span className="text-[#25D366] shrink-0 text-sm" title="Pinned question">
                              📌
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white leading-snug line-clamp-2">
                              {q.question}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              by <strong className="text-zinc-700 dark:text-zinc-300">{q.customerName}</strong> ({q.customerEmail})
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                        {q.productName || q.productId}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            q.status === "published"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : q.status === "pending"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>

                      <td className="p-3 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                        {q.answerCount}
                      </td>

                      <td className="p-3 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                        👍 {q.upvoteCount}
                      </td>

                      <td className="p-3 text-center text-zinc-500">
                        {formatDate(q.createdAt)}
                      </td>

                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            setAnsweringQuestion(q);
                            setAdminAnswerText("");
                            setModalError(null);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DCFCE7] dark:bg-[#18181B]/40 text-[#1EA855] dark:text-zinc-400 hover:bg-[#DCFCE7] dark:hover:bg-[#15803D]/60 cursor-pointer"
                        >
                          💬 Answer
                        </button>

                        {q.status === "published" ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleUpdateStatus(q.id, "hidden")}
                            className="px-2 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
                          >
                            Hide
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleUpdateStatus(q.id, "published")}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                          >
                            Publish
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleTogglePin(q.id, Boolean(q.isPinned))}
                          title={q.isPinned ? "Unpin question" : "Pin question to top"}
                          className={`px-2 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                            q.isPinned
                              ? "bg-[#25D366] text-white"
                              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
                          }`}
                        >
                          📌
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDelete(q.id)}
                          className="px-2 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Answer Modal */}
      {answeringQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 bg-white dark:bg-[#110620] rounded-3xl border border-zinc-200 dark:border-zinc-800/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>💬</span> Answer Customer Question
              </h3>
              <button
                type="button"
                onClick={() => setAnsweringQuestion(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                {modalError}
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
              <p className="text-[11px] text-zinc-400 font-semibold uppercase">Question:</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">
                "{answeringQuestion.question}"
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Asked by {answeringQuestion.customerName} on {answeringQuestion.productName || "Product"}
              </p>
            </div>

            <form onSubmit={handleSubmitAdminAnswer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Responding As
                </label>
                <input
                  type="text"
                  value={adminAuthorName}
                  onChange={(e) => setAdminAuthorName(e.target.value)}
                  placeholder="e.g. Nasrify Team"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Official Answer
                </label>
                <textarea
                  required
                  rows={4}
                  value={adminAnswerText}
                  onChange={(e) => setAdminAnswerText(e.target.value)}
                  placeholder="Write clear, comprehensive instructions or advice for this shopper..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnsweringQuestion(null)}
                  className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAnswer || !adminAnswerText.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white shadow-md shadow-[#25D366]/20 disabled:opacity-50 cursor-pointer"
                >
                  {submittingAnswer ? "Posting Answer..." : "Publish Answer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
