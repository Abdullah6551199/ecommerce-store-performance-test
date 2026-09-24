"use client";

import React, { useState } from "react";
import type { ProductQuestion } from "../shared/types";

interface Props {
  productId: string;
  onQuestionSubmitted?: (question: ProductQuestion, message: string) => void;
  onClose?: () => void;
  isInline?: boolean;
}

export default function AskQuestionForm({
  productId,
  onQuestionSubmitted,
  onClose,
  isInline = false,
}: Props): React.JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3) {
      setErrorMessage("Question must be at least 3 characters long.");
      return;
    }
    if (trimmedQuestion.length > 500) {
      setErrorMessage("Question cannot exceed 500 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/product-qa/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          question: trimmedQuestion,
          customerName: name.trim() || undefined,
          customerEmail: email.trim() || undefined,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as Record<string, any>;

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit question. Please try again.");
      }

      setSuccessMessage(json.message || "Your question has been submitted!");
      setQuestion("");

      // Store guest email in localStorage for upvoting tracking
      if (email.trim() && typeof window !== "undefined") {
        try {
          localStorage.setItem("nasrify_qa_guest_email", email.trim().toLowerCase());
        } catch {}
      }

      if (onQuestionSubmitted && json.data) {
        onQuestionSubmitted(json.data, json.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Ask a Question
          </h3>
        </div>
        {onClose && !isInline && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close form"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {successMessage ? (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Success!</span>
          </div>
          <p className="mt-1 text-xs">{successMessage}</p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-3 text-xs font-semibold underline cursor-pointer hover:opacity-80"
            >
              Done
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Your Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex M."
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Your Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@example.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Your Question <span className="text-red-500">*</span>
              </label>
              <span className={`text-[10px] ${question.length > 450 ? "text-amber-500 font-bold" : "text-zinc-400"}`}>
                {question.length}/500
              </span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={500}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about this product: sizing, materials, compatibility, usage..."
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || question.trim().length < 3}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Post Question</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (isInline) {
    return (
      <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-800/40 bg-purple-50/30 dark:bg-purple-950/20 shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg p-6 bg-white dark:bg-[#120524] rounded-3xl border border-zinc-200 dark:border-purple-800/40 shadow-2xl">
        {content}
      </div>
    </div>
  );
}
