"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { QuestionWithAnswers, ProductQuestion } from "../shared/types";
import AskQuestionForm from "./AskQuestionForm";
import QuestionItem from "./QuestionItem";

interface Props {
  productId: string;
}

export default function ProductQASection({ productId }: Props): React.JSX.Element | null {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAskModal, setShowAskModal] = useState<boolean>(false);
  const [appDisabled, setAppDisabled] = useState<boolean>(false);

  const fetchQuestions = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      try {
        let guestEmail = "";
        if (typeof window !== "undefined") {
          guestEmail = localStorage.getItem("nasrify_qa_guest_email") || "";
        }

        const url = `/api/product-qa/questions?productId=${encodeURIComponent(
          productId
        )}&page=${currentPage}&limit=10${
          guestEmail ? `&customerEmail=${encodeURIComponent(guestEmail)}` : ""
        }`;

        const res = await fetch(url);
        const json = (await res.json().catch(() => ({}))) as Record<string, any>;

        if (json.disabled) {
          setAppDisabled(true);
          return;
        }

        if (json.success && json.data) {
          setQuestions(json.data.questions || []);
          setTotal(json.data.total || 0);
        }
      } catch {
        // fail silently on edge fetch
      } finally {
        setLoading(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    if (productId) {
      fetchQuestions(page);
    }
  }, [productId, page, fetchQuestions]);

  const handleQuestionSubmitted = (newQ: ProductQuestion, message: string) => {
    // If published immediately, re-fetch
    if (newQ.status === "published") {
      fetchQuestions(1);
      setPage(1);
    }
  };

  if (appDisabled) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <section
      id="product-qa-section"
      aria-label="Product Questions and Answers"
      className="w-full rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-[#0c0418]/60 backdrop-blur-md p-6 sm:p-8 mt-10 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                Questions &amp; Answers ({total})
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Have questions about this item? Ask our store team or previous buyers.
              </p>
            </div>
          </div>
        </div>

        <button
          id="ask-question-btn"
          type="button"
          onClick={() => setShowAskModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Ask a Question</span>
        </button>
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <AskQuestionForm
          productId={productId}
          onClose={() => setShowAskModal(false)}
          onQuestionSubmitted={handleQuestionSubmitted}
        />
      )}

      {/* Questions Content */}
      <div id="qa-questions-list" className="mt-6 space-y-4">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent dark:border-purple-400" />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/5 p-8">
            <span className="text-3xl block mb-2">💬</span>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No questions yet — be the first to ask!
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Got a question regarding sizing, specifications, or shipping? Ask above and we will provide an answer quickly.
            </p>
            <button
              type="button"
              onClick={() => setShowAskModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-purple-300 dark:border-purple-700 text-xs font-semibold text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
            >
              Ask Now
            </button>
          </div>
        ) : (
          questions.map((q) => (
            <QuestionItem
              key={q.id}
              item={q}
              showUpvotes={true}
              onUpvoteChange={(targetType, targetId, count) => {
                if (targetType === "question") {
                  setQuestions((prev) =>
                    prev.map((item) =>
                      item.id === targetId ? { ...item, upvoteCount: count } : item
                    )
                  );
                }
              }}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div id="qa-pagination" className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/10">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
