"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/themes/blocks/Button";

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
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordMsg({ text: "Password changed successfully!", type: "success" });
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
      const res = await fetch("/api/customer/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Error deleting account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="h-64 rounded-2xl bg-[var(--theme-surface,#F4F4F5)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]">
      <div className="pb-2">
        <h1 className="text-2xl font-black text-[var(--theme-text,#18181B)] tracking-tight font-[family-name:var(--theme-font-heading)]">
          Profile Settings
        </h1>
        <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-0.5">
          Manage your personal customer profile details and security credentials
        </p>
      </div>

      {/* 1. Personal Information */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          Personal Information
        </h2>

        {profileMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold border ${
              profileMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] focus:outline-none focus:border-[var(--theme-primary,#25D366)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
              Email Address (Account ID)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] text-sm text-[var(--theme-text-muted,#71717A)] cursor-not-allowed font-mono"
            />
            <p className="text-[10px] text-[var(--theme-text-muted,#71717A)] mt-1">
              Contact store support if you need to transfer this account to a different email.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0300-1234567"
              className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] focus:outline-none focus:border-[var(--theme-primary,#25D366)]"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSavingProfile}
            disabled={isSavingProfile}
          >
            {isSavingProfile ? "Saving..." : "Save Profile Details"}
          </Button>
        </form>
      </div>

      {/* 2. Security & Password */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          Change Password
        </h2>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold border ${
              passwordMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] focus:outline-none focus:border-[var(--theme-primary,#25D366)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] focus:outline-none focus:border-[var(--theme-primary,#25D366)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-sm text-[var(--theme-text,#18181B)] focus:outline-none focus:border-[var(--theme-primary,#25D366)]"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isChangingPassword}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      {/* 3. Danger Zone: Delete Account */}
      <div className="p-6 sm:p-8 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-rose-600">
          Delete Customer Account
        </h2>
        <p className="text-xs text-[var(--theme-text-muted,#71717A)] leading-relaxed">
          Permanently erase your customer profile, saved addresses, order history, and product wishlist. This action cannot be reversed.
        </p>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
        >
          Delete My Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[var(--theme-border,#E4E4E7)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-rose-600">
              Confirm Account Deletion
            </h3>
            <p className="text-xs text-[var(--theme-text-muted,#71717A)] leading-relaxed">
              Please enter your password to confirm permanent deletion of your account.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text,#18181B)] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer disabled:opacity-50"
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
