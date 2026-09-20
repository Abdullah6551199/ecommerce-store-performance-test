"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MyDownloadsPage = dynamic(
  () => import("@/apps/digital-products/storefront/MyDownloadsPage"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-purple-100 dark:bg-purple-950/40 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-purple-100/50 dark:bg-purple-950/40" />
          ))}
        </div>
      </div>
    ),
  }
);

export default function AccountDownloadsPage(): React.JSX.Element {
  const [customerEmail, setCustomerEmail] = useState<string>("");

  useEffect(() => {
    document.title = "My Downloads - Customer Account";
    async function loadCustomer() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data: any = await res.json();
          if (data.customer?.email) {
            setCustomerEmail(data.customer.email);
          }
        }
      } catch {
        // Fallback to manual lookup on page
      }
    }
    loadCustomer();
  }, []);

  return <MyDownloadsPage initialEmail={customerEmail} />;
}
