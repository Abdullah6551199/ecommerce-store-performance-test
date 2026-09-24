"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/themes/blocks/Button";

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = (await res.json()) as any;

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to log in");
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-3xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-xl font-[family-name:var(--theme-font-body)]">
      {/* Left Brand Showcase Column */}
      <div className="md:col-span-5 bg-[var(--theme-accent,#18181B)] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[var(--theme-primary,#25D366)]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-lg">
              ⚡
            </span>
            <span className="font-extrabold tracking-tight text-xl text-white font-[family-name:var(--theme-font-heading)]">
              NASRIFY
            </span>
          </Link>

          <div className="pt-6">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--theme-primary,#25D366)] mb-3">
              Member Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white font-[family-name:var(--theme-font-heading)]">
              Welcome to Your Store.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Sign in to manage orders, track deliveries, save multiple shipping addresses, and sync your personalized wishlist across devices.
            </p>
          </div>
        </div>

        {/* Key Features Pill */}
        <div className="relative z-10 pt-8 space-y-3">
          <div className="flex items-center gap-3 text-xs text-zinc-200">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--theme-primary,#25D366)] text-[11px] font-bold">✓</span>
            <span>Real-time delivery updates &amp; tracking</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-200">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--theme-primary,#25D366)] text-[11px] font-bold">✓</span>
            <span>One-click Cash on Delivery reordering</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-200">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--theme-primary,#25D366)] text-[11px] font-bold">✓</span>
            <span>Saved addresses &amp; personalized wishlist</span>
          </div>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[var(--theme-text-muted,#71717A)] mt-1">
            Sign in to your account to continue
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] placeholder-[var(--theme-text-muted,#71717A)] focus:outline-none focus:border-[var(--theme-primary,#25D366)] focus:ring-1 focus:ring-[var(--theme-primary,#25D366)] transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[var(--theme-text,#18181B)]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-[var(--theme-primary,#25D366)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--theme-text-muted,#71717A)] select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--theme-border,#E4E4E7)] text-[var(--theme-primary,#25D366)] focus:ring-[var(--theme-primary,#25D366)]"
              />
              Remember me (30 days)
            </label>
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
                <span>Signing In...</span>
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-[var(--theme-border,#E4E4E7)] space-y-3">
          <p className="text-xs text-[var(--theme-text-muted,#71717A)]">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${redirectPath !== "/account" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              className="font-bold text-[var(--theme-primary,#25D366)] hover:underline"
            >
              Create an Account
            </Link>
          </p>

          <div>
            <Link
              href="/"
              className="text-xs text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] transition-colors"
            >
              &larr; Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-zinc-50">
      <Suspense fallback={<div className="text-center text-xs text-[var(--theme-text-muted,#71717A)]">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
