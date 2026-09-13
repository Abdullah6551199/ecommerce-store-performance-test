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
      <div className="space-y-6 max-w-2xl">
        <div className="h-64 rounded-3xl bg-purple-100/50 dark:bg-purple-950/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="pb-2">
        <h1 className="text-2xl font-black text-[#3C0561] dark:text-white tracking-tight">
          Profile Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-0.5">
          Manage your personal customer profile details and security credentials
        </p>
      </div>

      {/* 1. Personal Information */}
      <div className="p-6 sm:p-8 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-[#3C0561] dark:text-white">
          Personal Information
        </h2>

        {profileMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold border ${
              profileMsg.type === "success"
                ? "bg-purple-50 text-[#960DF2] border-purple-200 dark:bg-purple-950/40 dark:text-[#EACFFC] dark:border-purple-800"
                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#960DF2]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1.5">
              Email Address (Account ID)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full h-11 px-4 rounded-xl border border-purple-200/50 dark:border-purple-900/50 bg-slate-100 dark:bg-purple-950/40 text-sm text-slate-400 cursor-not-allowed font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Contact store support if you need to transfer this account to a different email.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0300-1234567"
              className="w-full h-11 px-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#960DF2]"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-6 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSavingProfile ? "Saving..." : "Save Profile Details"}
          </button>
        </form>
      </div>

      {/* 2. Security & Password */}
      <div className="p-6 sm:p-8 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-[#3C0561] dark:text-white">
          Change Password
        </h2>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold border ${
              passwordMsg.type === "success"
                ? "bg-purple-50 text-[#960DF2] border-purple-200 dark:bg-purple-950/40 dark:text-[#EACFFC] dark:border-purple-800"
                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#960DF2]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-11 px-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#960DF2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full h-11 px-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#960DF2]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-6 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* 3. Danger Zone: Delete Account */}
      <div className="p-6 sm:p-8 rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-rose-600 dark:text-rose-400">
          Delete Customer Account
        </h2>
        <p className="text-xs text-slate-600 dark:text-rose-200/80 leading-relaxed">
          Permanently erase your customer profile, saved addresses, order history, and product wishlist. This action cannot be reversed.
        </p>
        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="px-5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white font-extrabold text-xs transition"
        >
          Delete Account...
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1E0230] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-rose-600 dark:text-rose-400">Confirm Account Deletion</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Please enter your current account password to authorize the permanent deletion of your profile:
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
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
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteError(null);
                    setDeletePassword("");
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-900/40 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
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
