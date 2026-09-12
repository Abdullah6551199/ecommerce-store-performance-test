"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LOCAL_STORAGE_WISHLIST_KEY, StoredWishlist } from "@/components/WishlistContext";

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
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

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Sync local wishlist if present
      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as StoredWishlist;
            const productIds = (parsed.items || []).map((i) => i.productId);
            if (productIds.length > 0) {
              await fetch("/api/customer/wishlist/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productIds }),
              });
            }
          }
        }
      } catch {
        // Non-blocking sync failure
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
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18C729] to-[#FEF500] shadow-lg shadow-[#18C729]/20 mb-3">
          <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Access your orders, saved addresses, and wishlist
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729] focus:ring-1 focus:ring-[#18C729] transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <span className="text-[11px] text-zinc-400 cursor-not-allowed">
              Forgot password?
            </span>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729] focus:ring-1 focus:ring-[#18C729] transition"
          />
        </div>

        <div className="flex items-center justify-between py-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-[#18C729] focus:ring-[#18C729]"
            />
            Remember me (30 days)
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-[#18C729] text-black font-extrabold text-sm hover:bg-[#15af24] active:scale-[0.99] shadow-lg shadow-[#18C729]/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Signing In...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-zinc-100 dark:border-white/5">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup${redirectPath !== "/account" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
            className="font-bold text-[#18C729] hover:underline"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-xs text-zinc-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
