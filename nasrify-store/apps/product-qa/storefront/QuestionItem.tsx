"use client";

import React, { useState } from "react";
import type { QuestionWithAnswers, ProductAnswer } from "../shared/types";

interface Props {
  item: QuestionWithAnswers;
  showUpvotes?: boolean;
  onUpvoteChange?: (targetType: "question" | "answer", targetId: string, count: number, upvoted: boolean) => void;
}

export default function QuestionItem({
  item,
  showUpvotes = true,
  onUpvoteChange,
}: Props): React.JSX.Element {
  const [questionUpvoted, setQuestionUpvoted] = useState(Boolean(item.userHasUpvoted));
  const [questionUpvoteCount, setQuestionUpvoteCount] = useState(item.upvoteCount);
  const [upvotingQuestion, setUpvotingQuestion] = useState(false);

  // Answers local state
  const [answers, setAnswers] = useState<ProductAnswer[]>(item.answers || []);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [answerAuthorName, setAnswerAuthorName] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerSuccess, setAnswerSuccess] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const getGuestEmail = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("nasrify_qa_guest_email");
    } catch {
      return null;
    }
  };

  const handleToggleQuestionUpvote = async () => {
    if (upvotingQuestion) return;
    setUpvotingQuestion(true);

    try {
      const email = getGuestEmail();
      const res = await fetch("/api/product-qa/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "question",
          targetId: item.id,
          customerEmail: email || undefined,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as Record<string, any>;
      if (res.ok && json.success && json.data) {
        setQuestionUpvoted(json.data.upvoted);
        setQuestionUpvoteCount(json.data.upvoteCount);
        if (onUpvoteChange) {
          onUpvoteChange("question", item.id, json.data.upvoteCount, json.data.upvoted);
        }
      }
    } catch {
      // ignore
    } finally {
      setUpvotingQuestion(false);
    }
  };

  const handleToggleAnswerUpvote = async (ans: ProductAnswer) => {
    try {
      const email = getGuestEmail();
      const res = await fetch("/api/product-qa/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "answer",
          targetId: ans.id,
          customerEmail: email || undefined,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as Record<string, any>;
      if (res.ok && json.success && json.data) {
        setAnswers((prev) =>
          prev.map((a) =>
            a.id === ans.id
              ? { ...a, upvoteCount: json.data.upvoteCount, userHasUpvoted: json.data.upvoted }
              : a
          )
        );
      }
    } catch {
      // ignore
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setSubmittingAnswer(true);
    setAnswerError(null);
    setAnswerSuccess(null);

    try {
      const res = await fetch("/api/product-qa/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: item.id,
          answer: answerText.trim(),
          authorName: answerAuthorName.trim() || "Community Member",
          authorType: "customer",
        }),
      });

      const json = (await res.json().catch(() => ({}))) as Record<string, any>;
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit answer");
      }

      if (json.data) {
        setAnswers((prev) => [...prev, json.data]);
      }
      setAnswerSuccess("Thank you! Your answer has been published.");
      setAnswerText("");
      setTimeout(() => setShowAnswerForm(false), 2000);
    } catch (err: any) {
      setAnswerError(err.message || "Failed to submit answer");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const formatDate = (timestamp?: number | null) => {
    if (!timestamp) return "Recently";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(timestamp));
    } catch {
      return "Recently";
    }
  };

  return (
    <div
      id={`qa-question-${item.id}`}
      className={`rounded-2xl border transition-all p-5 ${
        item.isPinned
          ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/20 dark:bg-emerald-950/15 shadow-sm"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40"
      }`}
    >
      {/* Question Header & Content */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {item.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-[#25D366] border border-emerald-200 dark:border-emerald-800">
                📌 Pinned
              </span>
            )}
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">
              {item.customerName || "Customer"}
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              • {formatDate(item.createdAt)}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
            <span className="text-[#25D366] font-bold mr-1.5">Q:</span>
            {item.question}
          </h4>
        </div>

        {/* Upvote Button */}
        {showUpvotes && (
          <button
            type="button"
            onClick={handleToggleQuestionUpvote}
            disabled={upvotingQuestion}
            aria-label="Upvote this question"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              questionUpvoted
                ? "border-[#25D366] bg-emerald-50 dark:bg-emerald-950/60 text-[#25D366] shadow-sm"
                : "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:border-[#25D366] hover:text-[#25D366]"
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${questionUpvoted ? "scale-110 text-[#25D366]" : ""}`}
              fill={questionUpvoted ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span>{questionUpvoteCount}</span>
          </button>
        )}
      </div>

      {/* Answers Section */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 space-y-3">
        {answers.length > 0 ? (
          answers.map((ans) => {
            const isNasrifyTeam = ans.authorType === "admin" || ans.authorType === "nasrify_team";
            return (
              <div
                key={ans.id}
                className={`rounded-xl p-3.5 text-xs transition-all ${
                  isNasrifyTeam
                    ? "border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20"
                    : "border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#25D366]">A:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {isNasrifyTeam ? "Nasrify Team" : ans.authorName}
                    </span>
                    {isNasrifyTeam && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#25D366] text-white">
                        Verified Store Team
                      </span>
                    )}
                    {ans.isAccepted && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ✓ Accepted
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      • {formatDate(ans.createdAt)}
                    </span>
                  </div>

                  {showUpvotes && (
                    <button
                      type="button"
                      onClick={() => handleToggleAnswerUpvote(ans)}
                      className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-[#25D366] transition-colors cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span>{ans.upvoteCount}</span>
                    </button>
                  )}
                </div>

                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed pl-5 whitespace-pre-line">
                  {ans.answer}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
            No answers yet. Our team or other shoppers will respond shortly.
          </p>
        )}

        {/* Answer Button & Collapsible Form */}
        <div className="pt-1">
          {!showAnswerForm ? (
            <button
              type="button"
              onClick={() => setShowAnswerForm(true)}
              className="text-xs font-semibold text-[#25D366] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>+ Answer this question</span>
            </button>
          ) : (
            <form onSubmit={handlePostAnswer} className="mt-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
              {answerError && (
                <div className="p-2 text-xs rounded-lg bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                  {answerError}
                </div>
              )}
              {answerSuccess && (
                <div className="p-2 text-xs rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {answerSuccess}
                </div>
              )}
              <div>
                <input
                  type="text"
                  value={answerAuthorName}
                  onChange={(e) => setAnswerAuthorName(e.target.value)}
                  placeholder="Your Name (optional)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-white/15 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <textarea
                  required
                  rows={2}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Write your answer..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-white/15 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnswerForm(false)}
                  className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerText.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#25D366] hover:bg-[#1EA855] text-white disabled:opacity-50 cursor-pointer"
                >
                  {submittingAnswer ? "Posting..." : "Submit Answer"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
