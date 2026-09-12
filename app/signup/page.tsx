"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LOCAL_STORAGE_WISHLIST_KEY, StoredWishlist } from "@/components/WishlistContext";

function SignupForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          rememberMe,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
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
        // Non-blocking
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18C729] to-[#FEF500] shadow-lg shadow-[#18C729]/20 mb-3">
          <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          Create an Account
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Join today to save addresses, track orders, and get notifications
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
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729] focus:ring-1 focus:ring-[#18C729] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Email Address <span className="text-red-500">*</span>
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
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300-1234567"
            className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729] focus:ring-1 focus:ring-[#18C729] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729] focus:ring-1 focus:ring-[#18C729] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
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
            Remember me
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
              <span>Creating Account...</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-zinc-100 dark:border-white/5">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href={`/login${redirectPath !== "/account" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
            className="font-bold text-[#18C729] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage(): React.JSX.Element {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-xs text-zinc-500">Loading sign up...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
