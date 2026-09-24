import React from "react";
import type { Metadata } from "next";
import { getActiveTheme } from "@/lib/themes/loader";
import { renderPageTheme } from "@/lib/themes/engine";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | Nasrify Store",
  description: "Secure 256-bit encrypted checkout with Cash on Delivery.",
};

export default async function CheckoutPage() {
  const theme = await getActiveTheme();

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-[var(--theme-text,#18181B)]">
      <div className="max-w-6xl mx-auto">
        {renderPageTheme(theme, "checkout", {})}
      </div>
    </div>
  );
}
