import React from "react";
import type { Metadata } from "next";
import { getActiveTheme } from "@/lib/themes/loader";
import { renderPageTheme } from "@/lib/themes/engine";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account Overview | Nasrify Store",
  description: "View recent orders, notifications, and manage your account.",
};

export default async function AccountPage() {
  const theme = await getActiveTheme();

  return (
    <div className="w-full">
      {renderPageTheme(theme, "account", {})}
    </div>
  );
}
