"use client";

import React, { useState, useEffect } from "react";
import SettingsManager from "@/components/admin/SettingsManager";
import AdminAccountManager from "@/components/admin/AdminAccountManager";

interface AdminProfile {
  email: string;
  role: string;
}

export default function AdminSettingsPage(): React.JSX.Element {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    document.title = "Settings - Admin Panel";
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me");
        const json = (await res.json()) as any;
        if (res.ok && json.success && json.data) {
          setAdmin(json.data);
        }
      } catch (err) {
        console.warn("Failed to fetch admin profile:", err);
      } finally {
        setLoadingAdmin(false);
      }
    };
    fetchAdmin();
  }, []);

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Store & System Settings</h1>
        <p className="mt-1 text-xs text-zinc-600 dark:text-white/60">
          Manage dynamic storefront branding, contact details, social links, and admin authentication credentials.
        </p>
      </div>

      {/* 1. Global Storefront Configuration */}
      <section className="space-y-4">
        <div className="border-b border-zinc-200 dark:border-white/10 pb-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Storefront Configuration</h2>
          <p className="text-xs text-zinc-500 dark:text-white/50">
            Real-time settings reflected across the storefront header, footer, and brand identity.
          </p>
        </div>
        <SettingsManager />
      </section>

      {/* 2. Security & Admin Profile */}
      <section className="space-y-6 pt-6 border-t border-zinc-200 dark:border-white/10">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Security & Admin Profile</h2>
          <p className="text-xs text-zinc-500 dark:text-white/50">
            Manage your administrative credentials and security settings.
          </p>
        </div>

        {loadingAdmin ? (
          <div className="h-44 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-6 shadow-lg animate-pulse" />
        ) : (
          <AdminAccountManager
            initialEmail={admin?.email || "admin@example.com"}
            role={admin?.role || "admin"}
          />
        )}
      </section>
    </div>
  );
}
