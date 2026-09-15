"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";

function ForgotPasswordForm(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset instructions");
      }

      setSuccessMessage(
        data.message || "If an account exists with this email, password reset instructions have been dispatched."
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl border border-purple-100 dark:border-purple-700 bg-white dark:bg-[#3C0561] shadow-2xl shadow-purple-500/10">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 shadow-md mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#3C0561] dark:text-[#EACFFC]">
          Forgot Your Password?
        </h1>
        <p className="text-xs text-purple-700/80 dark:text-purple-300/80 mt-1">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-2xl border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-600 dark:text-red-400 flex items-start gap-2.5 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 text-xs font-semibold text-purple-800 dark:text-purple-200 flex items-start gap-2.5 animate-in fade-in">
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold text-[#3C0561] dark:text-purple-100">Instructions Dispatched</p>
            <p className="mt-0.5 text-purple-700/90 dark:text-purple-300/90">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#3C0561] dark:text-purple-200 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-4 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/40 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-purple-400 hover:bg-purple-500 text-white font-extrabold text-sm shadow-lg shadow-purple-400/25 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Sending Reset Link...</span>
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-purple-100 dark:border-purple-700/60 space-y-2">
        <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-purple-600 dark:text-purple-300 hover:underline">
            Back to Sign In
          </Link>
        </p>
        <div>
          <Link href="/" className="text-xs text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
            &larr; Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-xs text-purple-500">Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
