"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Button from "@/components/themes/blocks/Button";

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
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-xl font-[family-name:var(--theme-font-body)]">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--theme-primary-light,#DCFCE7)] text-[var(--theme-accent,#18181B)] shadow-xs mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          Forgot Your Password?
        </h1>
        <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-600 flex items-start gap-2.5 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold text-emerald-900">Instructions Dispatched</p>
            <p className="mt-0.5 text-emerald-700">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] placeholder-[var(--theme-text-muted,#71717A)] focus:outline-none focus:border-[var(--theme-primary,#25D366)] focus:ring-1 focus:ring-[var(--theme-primary,#25D366)] transition"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading}
          className="w-full justify-center"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Sending Reset Link...</span>
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-[var(--theme-border,#E4E4E7)] space-y-2">
        <p className="text-xs text-[var(--theme-text-muted,#71717A)]">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-[var(--theme-primary,#25D366)] hover:underline">
            Back to Sign In
          </Link>
        </p>
        <div>
          <Link href="/" className="text-xs text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] transition-colors">
            &larr; Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-zinc-50">
      <Suspense fallback={<div className="text-center text-xs text-[var(--theme-text-muted,#71717A)]">Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
