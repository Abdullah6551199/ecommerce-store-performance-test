"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/themes/blocks/Button";

function ResetPasswordForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "", color: "" };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-400" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-400" };
      case 3:
        return { score: 3, label: "Good", color: "bg-emerald-400" };
      case 4:
      default:
        return { score: 4, label: "Strong", color: "bg-[var(--theme-primary,#25D366)]" };
    }
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token.trim()) {
      setError("Please provide a valid password reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccessMessage(
        data.message || "Password has been successfully updated. Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 2500);
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          Set New Password
        </h1>
        <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1">
          Create a strong, unique password to secure your account.
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
            <p className="font-bold text-emerald-900">Password Updated</p>
            <p className="mt-0.5 text-emerald-700">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!initialToken && (
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
              Reset Token <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token from reset email"
              className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] placeholder-[var(--theme-text-muted,#71717A)] focus:outline-none focus:border-[var(--theme-primary,#25D366)] focus:ring-1 focus:ring-[var(--theme-primary,#25D366)] transition font-mono"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
            New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full h-11 pl-4 pr-11 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] placeholder-[var(--theme-text-muted,#71717A)] focus:outline-none focus:border-[var(--theme-primary,#25D366)] focus:ring-1 focus:ring-[var(--theme-primary,#25D366)] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] transition cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Password strength indicator */}
          {newPassword.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1.5 h-1.5 w-full">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      level <= passwordStrength.score ? passwordStrength.color : "bg-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] text-[var(--theme-text-muted,#71717A)]">
                <span>Strength: <strong>{passwordStrength.label}</strong></span>
                <span>Min 8 chars, numbers &amp; symbols</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full h-11 pl-4 pr-11 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] placeholder-[var(--theme-text-muted,#71717A)] focus:outline-none focus:border-[var(--theme-primary,#25D366)] focus:ring-1 focus:ring-[var(--theme-primary,#25D366)] transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] transition cursor-pointer"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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
              <span>Updating Password...</span>
            </>
          ) : (
            "Reset Password"
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

export default function ResetPasswordPage(): React.JSX.Element {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-zinc-50">
      <Suspense fallback={<div className="text-center text-xs text-[var(--theme-text-muted,#71717A)]">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
