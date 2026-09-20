import React from "react";
import type { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/auth";
import { getPendingThemes } from "@/lib/themes/marketplace";
import { SuperPendingThemesClient } from "@/components/SuperPendingThemesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Approval Queue — Nasrify Themes Super Admin",
  description: "Review and approve storefront theme submissions for the Nasrify Marketplace.",
};

function checkIsSuperAdmin(email?: string): boolean {
  if (!email) return false;
  const superAdminList = (
    process.env.SUPER_ADMIN_EMAILS || "admin@apexstore.com,admin@example.com"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return superAdminList.includes(email.toLowerCase());
}

export default async function SuperPendingPage(): Promise<React.JSX.Element> {
  const admin = await getCurrentAdmin();
  const isSuperAdmin = admin ? checkIsSuperAdmin(admin.email) || admin.role === "admin" : false;
  const initialPending = isSuperAdmin ? await getPendingThemes() : [];

  return (
    <div className="min-h-screen pb-16">
      <SuperPendingThemesClient
        initialPending={initialPending}
        isSuperAdmin={isSuperAdmin}
        userEmail={admin?.email || null}
      />
    </div>
  );
}
