"use client";

import React, { useState } from "react";

interface AdminAccountManagerProps {
  initialEmail: string;
  role: string;
}

export default function AdminAccountManager({
  initialEmail,
  role,
}: AdminAccountManagerProps): React.JSX.Element {
  const [currentEmail, setCurrentEmail] = useState(initialEmail);

  // Email form state
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Password form state
  const [pwdCurrentPassword, setPwdCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (!emailCurrentPassword) {
      setEmailError("Current password is required to verify your identity.");
      return;
    }

    if (!newEmail || !newEmail.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailLoading(true);

    try {
      const res = await fetch("/api/admin/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: emailCurrentPassword,
          newEmail,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
        email?: string;
      };

      if (!res.ok || !data.success) {
        setEmailError(data.error || "Failed to update email address.");
        return;
      }

      const updatedEmail = data.email || newEmail;
      setCurrentEmail(updatedEmail);
      setEmailSuccess(data.message || "Admin email updated successfully.");
      setEmailCurrentPassword("");
      setNewEmail("");
    } catch (_err) {
      setEmailError("A network error occurred while updating email. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!pwdCurrentPassword) {
      setPwdError("Current password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch("/api/admin/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdCurrentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };

      if (!res.ok || !data.success) {
        setPwdError(data.error || "Failed to update password.");
        return;
      }

      setPwdSuccess(data.message || "Admin password updated successfully.");
      setPwdCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (_err) {
      setPwdError("A network error occurred while updating password. Please try again.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Active Session Overview Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1611] p-6 shadow-lg">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Active Administrative Session
        </h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
              Admin Email
            </span>
            <p className="mt-1 text-sm font-semibold text-white truncate" id="admin-display-email">
              {currentEmail}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
              Assigned Role
            </span>
            <p className="mt-1 text-sm font-semibold text-[#18C729] uppercase">{role}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
              Account Status
            </span>
            <p className="mt-1 text-sm font-semibold text-[#FEF500]">Active & Verified</p>
          </div>
        </div>
      </div>

      {/* 2. Update Admin Email Form */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1611] p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Update Admin Email</h2>
            <p className="text-xs text-white/50">
              Change the email address used to log into the administrative control panel
            </p>
          </div>
        </div>

        {emailError && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {emailError}
          </div>
        )}

        {emailSuccess && (
          <div className="mt-4 rounded-xl border border-[#18C729]/40 bg-[#18C729]/10 p-3 text-xs text-[#18C729]">
            {emailSuccess}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="mt-5 space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Current Password (Verification)
            </label>
            <input
              type="password"
              required
              value={emailCurrentPassword}
              onChange={(e) => setEmailCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              New Email Address
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="newadmin@example.com"
              className="mt-1.5 block w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
            />
          </div>

          <button
            type="submit"
            disabled={emailLoading}
            className="rounded-xl bg-[#18C729] px-5 py-2.5 text-xs font-bold text-black shadow-md shadow-[#18C729]/20 transition-all hover:bg-[#15b124] disabled:opacity-50"
          >
            {emailLoading ? "Updating Email..." : "Update Email"}
          </button>
        </form>
      </div>

      {/* 3. Update Admin Password Form */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1611] p-6 shadow-lg">
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
            <h2 className="text-base font-bold text-white">Update Admin Password</h2>
            <p className="text-xs text-white/50">
              Ensure your administrator credentials use a strong passphrase (minimum 8 characters)
            </p>
          </div>
        </div>

        {pwdError && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {pwdError}
          </div>
        )}

        {pwdSuccess && (
          <div className="mt-4 rounded-xl border border-[#18C729]/40 bg-[#18C729]/10 p-3 text-xs text-[#18C729]">
            {pwdSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Current Password
            </label>
            <input
              type="password"
              required
              value={pwdCurrentPassword}
              onChange={(e) => setPwdCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1.5 block w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="mt-1.5 block w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
            />
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="rounded-xl bg-[#18C729] px-5 py-2.5 text-xs font-bold text-black shadow-md shadow-[#18C729]/20 transition-all hover:bg-[#15b124] disabled:opacity-50"
          >
            {pwdLoading ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
