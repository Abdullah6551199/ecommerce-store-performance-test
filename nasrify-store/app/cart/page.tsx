import React from "react";
import type { Metadata } from "next";
import { getActiveTheme } from "@/lib/themes/loader";
import { renderPageTheme } from "@/lib/themes/engine";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shopping Cart | Nasrify Store",
  description: "View and manage items in your shopping cart before checkout.",
};

export default async function CartPage() {
  const theme = await getActiveTheme();

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-[var(--theme-text,#18181B)]">
      <div className="max-w-7xl mx-auto">
        {renderPageTheme(theme, "cart", {})}
      </div>
    </div>
  );
}
