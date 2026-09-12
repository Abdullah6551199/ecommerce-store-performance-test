"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountProfilePage(): React.JSX.Element {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = (await res.json()) as {
            customer?: { name?: string; email?: string; phone?: string | null };
          };
          if (data.customer) {
            setName(data.customer.name || "");
            setEmail(data.customer.email || "");
            setPhone(data.customer.phone || "");
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileMsg({ text: "Profile details updated successfully!", type: "success" });
    } catch (err: unknown) {
      setProfileMsg({
        text: err instanceof Error ? err.message : "Error updating profile",
        type: "error",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match", type: "error" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ text: "Password must be at least 8 characters long", type: "error" });
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/customer/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordMsg({ text: "Password updated successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordMsg({
        text: err instanceof Error ? err.message : "Error changing password",
        type: "error",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const res = await fetch("/api/customer/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationPassword: deletePassword }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-3xl bg-zinc-200 dark:bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Profile Settings
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage your personal account details and security settings
        </p>
      </div>

      {/* 1. Personal Information */}
      <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
          Personal Information
        </h2>

        {profileMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold ${
              profileMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email Address (Account ID)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/10 text-sm text-zinc-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              Contact support if you need to transfer this account to a different email.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0300-1234567"
              className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-5 py-2.5 rounded-xl bg-[#18C729] text-black font-extrabold text-xs hover:bg-[#15af24] shadow-md shadow-[#18C729]/20 transition disabled:opacity-50"
          >
            {isSavingProfile ? "Saving..." : "Save Profile Details"}
          </button>
        </form>
      </div>

      {/* 2. Security & Password */}
      <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
          Change Password
        </h2>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold ${
              passwordMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-[#18C729] text-zinc-800 dark:text-zinc-200 font-extrabold text-xs hover:text-[#18C729] transition disabled:opacity-50"
          >
            {isChangingPassword ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* 3. Delete Account (Danger Zone) */}
      <div className="p-6 sm:p-8 rounded-3xl border border-red-500/20 bg-red-500/5 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-red-600 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Permanently delete your customer account, saved addresses, notifications, and preferences.
          Past order receipts will remain for legal store auditing.
        </p>
        <button
          type="button"
          onClick={() => {
            setDeletePassword("");
            setDeleteError(null);
            setDeleteModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 transition"
        >
          Delete Account Permanently
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-white dark:bg-[#0e0909] p-6 sm:p-8 shadow-2xl space-y-4">
            <h2 className="text-base font-black text-red-600 dark:text-red-400">
              Confirm Account Deletion
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              This action cannot be undone. Please enter your account password to confirm:
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full h-11 px-4 rounded-xl border border-red-500/30 bg-zinc-50 dark:bg-white/5 text-sm text-zinc-900 dark:text-white"
              />

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
