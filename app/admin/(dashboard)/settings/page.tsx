import React from "react";
import SettingsManager from "@/components/admin/SettingsManager";
import AdminAccountManager from "@/components/admin/AdminAccountManager";
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
            Manage your administrative credentials and security settings.
          </p>
        </div>

        <AdminAccountManager
          initialEmail={admin?.email || "admin@example.com"}
          role={admin?.role || "admin"}
        />
      </section>
    </div>
  );
}
