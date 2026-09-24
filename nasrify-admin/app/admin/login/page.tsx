"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        redirect?: string;
        remainingSeconds?: number;
      };

      if (!res.ok || !data.success) {
        setError(data.error || "Login failed");
        if (res.status === 429 && data.remainingSeconds) {
          setRemainingSeconds(data.remainingSeconds);
        }
        return;
      }

      const target =
        fromParam && fromParam.startsWith("/admin") && !fromParam.startsWith("/admin/login")
          ? fromParam
          : data.redirect || "/admin/dashboard";

      router.push(target);
      router.refresh();
    } catch (_err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md space-y-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#121214]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
      {/* Brand Icon & Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] shadow-lg shadow-[#25D366]/25">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Nasrify Admin
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Sign in with administrator credentials to manage your store
        </p>
      </div>

      {/* Redirect Notification Notice */}
      {fromParam && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-3 text-xs text-zinc-700 dark:text-zinc-300">
          <p className="font-semibold">Authentication Required</p>
          <p className="opacity-80 mt-0.5">Please sign in to access your requested administration page.</p>
        </div>
      )}

      {/* Error Alert Box */}
      {error && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            remainingSeconds
              ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300"
              : "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{remainingSeconds ? "Rate Limit Active" : "Authentication Error"}</span>
          </div>
          <p className="mt-1 text-xs opacity-90">{error}</p>
          {remainingSeconds && (
            <p className="mt-2 text-[11px] font-mono opacity-80">
              Lockout window remaining: ~{remainingSeconds}s
            </p>
          )}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="mt-2 block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-2 block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366] transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || (remainingSeconds !== null && remainingSeconds > 0)}
          className="w-full rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-4 py-3.5 text-sm font-extrabold text-white shadow-md shadow-[#25D366]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Authenticating..." : "Sign In to Admin"}
        </button>
      </form>

      {/* Security note */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Protected by Cloudflare Workers &amp; D1 Rate Limiting (3 attempts / 5 min lockout)
      </div>
    </div>
  );
}

export default function AdminLoginPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-[#09090B] px-4 py-12 selection:bg-[#25D366] selection:text-white relative">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      <Suspense fallback={<div className="h-96 w-96 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
