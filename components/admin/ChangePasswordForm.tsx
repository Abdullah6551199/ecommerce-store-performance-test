"use client";

import React, { useState } from "react";

export default function ChangePasswordForm(): React.JSX.Element {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string; message?: string };

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update password.");
        return;
      }

      setSuccess("Your admin password was successfully updated in Cloudflare D1.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (_err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Security & Password Management</h2>
          <p className="text-xs text-zinc-500 dark:text-white/50">
            Change your administrator credentials stored in Cloudflare D1
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-[#18C729]/40 bg-[#18C729]/10 p-3 text-xs text-[#18C729]">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-w-lg">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-white/70">
            Current Password
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-white/70">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-white/70">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#18C729] px-5 py-2.5 text-xs font-bold text-black shadow-md shadow-[#18C729]/20 transition-all hover:bg-[#15b124] disabled:opacity-50"
        >
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
