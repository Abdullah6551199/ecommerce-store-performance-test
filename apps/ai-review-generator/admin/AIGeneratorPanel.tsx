"use client";

import React, { useState } from "react";
import type { ReviewTone, ReviewLanguage, ReviewerStyle, ApprovalMode, AIGeneratedReview } from "../shared/types";

interface AIGeneratorPanelProps {
  productId: string;
  productTitle?: string;
  productDescription?: string;
  productCategory?: string;
  onReviewsGenerated?: () => void;
}

export function AIGeneratorPanel({
  productId,
  productTitle = "Product",
  productDescription = "",
  productCategory = "",
  onReviewsGenerated,
}: AIGeneratorPanelProps) {
  const [count, setCount] = useState<number>(5);
  const [ratingMin, setRatingMin] = useState<number>(4);
  const [ratingMax, setRatingMax] = useState<number>(5);
  const [tone, setTone] = useState<ReviewTone>("positive");
  const [language, setLanguage] = useState<ReviewLanguage>("english");
  const [reviewerStyle, setReviewerStyle] = useState<ReviewerStyle>("mix");
  const [dateRangeDays, setDateRangeDays] = useState<number>(30);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>("pending");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    batchId: string;
    generatedCount: number;
    approvalMode: string;
    samples: AIGeneratedReview[];
  } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const res = await fetch("/api/admin/apps/ai-review-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productTitle,
          productDescription,
          productCategory,
          count,
          ratingMin,
          ratingMax,
          tone,
          language,
          reviewerStyle,
          dateRangeDays,
          approvalMode,
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation failed.");
      }

      setSuccessResult({
        batchId: data.data.batchId,
        generatedCount: data.data.generatedCount,
        approvalMode: data.data.approvalMode,
        samples: data.data.sampleReviews || [],
      });

      if (onReviewsGenerated) {
        onReviewsGenerated();
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate AI reviews.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              AI Review Generator
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium border border-purple-500/30">
                Cloudflare Workers AI
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Generating customer reviews for: <span className="text-purple-300 font-medium">{productTitle}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Ethical / Legal Warning */}
      <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-200 text-xs flex items-start gap-2.5">
        <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="leading-relaxed">
          <strong>Ethical & Legal Notice:</strong> AI-generated reviews are marked internally with <code className="bg-amber-900/50 px-1 py-0.5 rounded text-amber-300">is_ai_generated = 1</code>. Store owners are responsible for complying with local consumer protection laws. In some jurisdictions, publishing AI reviews without clear disclosure may be prohibited.
        </p>
      </div>

      {/* Form Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Count */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Number of Reviews</label>
          <input
            type="number"
            min={1}
            max={200}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value || "1", 10)))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Rating Min */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Minimum Stars</label>
          <select
            value={ratingMin}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setRatingMin(val);
              if (ratingMax < val) setRatingMax(val);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            {[1, 2, 3, 4, 5].map((s) => (
              <option key={s} value={s}>{s} Star{s > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>

        {/* Rating Max */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Maximum Stars</label>
          <select
            value={ratingMax}
            onChange={(e) => setRatingMax(parseInt(e.target.value, 10))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            {[1, 2, 3, 4, 5].filter((s) => s >= ratingMin).map((s) => (
              <option key={s} value={s}>{s} Star{s > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Review Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as ReviewTone)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="positive">Positive & Satisfied</option>
            <option value="casual">Casual & Conversational</option>
            <option value="detailed">Detailed & Analytical</option>
            <option value="brief">Brief & Punchy</option>
            <option value="enthusiastic">Enthusiastic & High-Energy</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as ReviewLanguage)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="english">English (Global)</option>
            <option value="urdu">Urdu (اردو)</option>
            <option value="roman_urdu">Roman Urdu</option>
            <option value="mixed">Mixed (English + Roman Urdu)</option>
          </select>
        </div>

        {/* Reviewer Style */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reviewer Names</label>
          <select
            value={reviewerStyle}
            onChange={(e) => setReviewerStyle(e.target.value as ReviewerStyle)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="mix">Mix of Styles</option>
            <option value="pakistani">Pakistani Names</option>
            <option value="international">International Names</option>
          </select>
        </div>

        {/* Spread Range */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Spread Over (Days)</label>
          <input
            type="number"
            min={1}
            max={365}
            value={dateRangeDays}
            onChange={(e) => setDateRangeDays(Math.max(1, parseInt(e.target.value || "1", 10)))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Approval Mode */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-2">Publishing Mode</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="approvalMode"
                value="pending"
                checked={approvalMode === "pending"}
                onChange={() => setApprovalMode("pending")}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span>Pending Review (Recommended)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="approvalMode"
                value="auto"
                checked={approvalMode === "auto"}
                onChange={() => setApprovalMode("auto")}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span>Auto-Publish Immediately</span>
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg text-red-300 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating Reviews with Workers AI...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Generate {count} Review{count > 1 ? "s" : ""}
            </>
          )}
        </button>

        {successResult && (
          <div className="text-xs text-emerald-400 flex items-center gap-2">
            <span>✓ Batch {successResult.batchId} created</span>
            <a href="/admin/reviews" className="underline hover:text-emerald-300 font-medium">
              View in Reviews Manager →
            </a>
          </div>
        )}
      </div>

      {/* Result Preview Box */}
      {successResult && (
        <div className="mt-4 p-4 bg-slate-950/70 border border-purple-500/20 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span className="font-semibold text-purple-300">Generated Samples Preview</span>
            <span>Status: <strong className="text-white">{successResult.approvalMode === "auto" ? "Published" : "Pending"}</strong></span>
          </div>

          <div className="space-y-2.5">
            {successResult.samples.map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{s.authorName}</span>
                  <span className="text-amber-400 font-semibold">{"★".repeat(s.rating)} ({s.rating}/5)</span>
                </div>
                <div className="font-medium text-purple-200">{s.title}</div>
                <p className="text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
