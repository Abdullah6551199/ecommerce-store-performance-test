import React from "react";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import SettingsManager from "@/components/admin/SettingsManager";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage(): Promise<React.JSX.Element> {
  const admin = await getCurrentAdmin();

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Store & System Settings</h1>
        <p className="mt-1 text-xs text-white/60">
          Manage dynamic storefront branding, contact details, social links, and admin authentication credentials.
        </p>
      </div>

      {/* 1. Global Storefront Configuration */}
      <section className="space-y-4">
        <div className="border-b border-white/10 pb-2">
          <h2 className="text-lg font-bold text-white">Storefront Configuration</h2>
          <p className="text-xs text-white/50">
            Real-time settings reflected across the storefront header, footer, and brand identity.
          </p>
        </div>
        <SettingsManager />
      </section>

      {/* 2. Security & Admin Profile */}
      <section className="space-y-6 pt-6 border-t border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white">Security & Admin Profile</h2>
          <p className="text-xs text-white/50">
            Manage your administrative session and credentials.
          </p>
        </div>

        {/* Account Info Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1611] p-6 shadow-lg">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Active Session</h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Email</span>
              <p className="mt-1 text-sm font-semibold text-white truncate">{admin?.email || "admin@example.com"}</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Role</span>
              <p className="mt-1 text-sm font-semibold text-[#18C729] uppercase">{admin?.role || "admin"}</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Storage</span>
              <p className="mt-1 text-sm font-semibold text-[#FEF500]">Cloudflare D1</p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <ChangePasswordForm />
      </section>
    </div>
  );
}
