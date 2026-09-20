import React from "react";
import type { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/auth";
import { getDeveloperThemes } from "@/lib/themes/marketplace";
import { ThemeDeveloperPortalClient } from "@/components/ThemeDeveloperPortalClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Developer Portal — Nasrify Themes Hub",
  description: "Publish and monetize storefront themes for the Nasrify eCommerce engine.",
};

export default async function DeveloperPage(): Promise<React.JSX.Element> {
  const admin = await getCurrentAdmin();
  const initialThemes = admin ? await getDeveloperThemes(admin.email) : [];

  const initialUser = admin
    ? {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      }
    : null;

  return (
    <div className="min-h-screen pb-16">
      <ThemeDeveloperPortalClient
        initialUser={initialUser}
        initialThemes={initialThemes}
      />
    </div>
  );
}
