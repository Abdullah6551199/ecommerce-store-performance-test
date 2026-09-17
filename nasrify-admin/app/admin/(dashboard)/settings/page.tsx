"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";
import { fetchWithClientCache } from "@/lib/client-cache";

const SettingsManager = dynamic(
  () => import("@/components/admin/SettingsManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Storefront Settings..." /> }
);

const AdminAccountManager = dynamic(
  () => import("@/components/admin/AdminAccountManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Admin Account..." /> }
);

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
        const json = await fetchWithClientCache<AdminProfile>("/api/admin/me", { ttlMs: 60000 });
        if (json.success && json.data) {
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
    <AdminErrorBoundary moduleName="Settings">
      <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Store & System Settings</h1>
        <p className="mt-1 text-xs text-zinc-600 dark:text-white/60">
          Manage dynamic storefront branding, contact details, social links, tax rates, shipping zones, and admin credentials.
        </p>
      </div>

      {/* Quick Access to Settings Sub-Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="/admin/settings/tax"
          className="group rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 p-5 shadow-sm hover:border-purple-400 dark:hover:border-purple-600 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold">
                %
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#3C0561] dark:text-[#EACFFC] group-hover:text-purple-600 transition-colors">
                  Tax Management
                </h3>
                <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70 mt-0.5">
                  Country/state tax rates &amp; detection
                </p>
              </div>
            </div>
            <span className="text-purple-500 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </a>

        <a
          href="/admin/settings/shipping-zones"
          className="group rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 p-5 shadow-sm hover:border-purple-400 dark:hover:border-purple-600 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#3C0561] dark:text-[#EACFFC] group-hover:text-purple-600 transition-colors">
                  Shipping Zones
                </h3>
                <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70 mt-0.5">
                  Regional rates, free thresholds, delivery
                </p>
              </div>
            </div>
            <span className="text-purple-500 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </a>

        <a
          href="/admin/settings/trust-badges"
          className="group rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 p-5 shadow-sm hover:border-purple-400 dark:hover:border-purple-600 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#3C0561] dark:text-[#EACFFC] group-hover:text-purple-600 transition-colors">
                  Trust Badges
                </h3>
                <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70 mt-0.5">
                  Security, returns &amp; payment badges
                </p>
              </div>
            </div>
            <span className="text-purple-500 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </a>

        <a
          href="/admin/settings/cookie-consent"
          className="group rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 p-5 shadow-sm hover:border-purple-400 dark:hover:border-purple-600 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300 text-lg">
                🍪
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#3C0561] dark:text-[#EACFFC] group-hover:text-purple-600 transition-colors">
                  Cookie Consent
                </h3>
                <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70 mt-0.5">
                  GDPR cookie banner &amp; legal policy
                </p>
              </div>
            </div>
            <span className="text-purple-500 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </a>
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
    </AdminErrorBoundary>
  );
}
