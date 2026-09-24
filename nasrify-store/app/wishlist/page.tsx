"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Button from "@/components/themes/blocks/Button";

const WishlistPage = dynamic(() => import("@/apps/wishlist/storefront/WishlistPage"), {
  ssr: false,
  loading: () => (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-pulse space-y-6">
      <div className="h-6 w-48 bg-[var(--theme-surface,#F4F4F5)] rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-[var(--theme-surface,#F4F4F5)]" />
        ))}
      </div>
    </div>
  ),
});

export default function StorefrontWishlistPage(): React.JSX.Element {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    async function checkApp() {
      try {
        const res = await fetch("/api/apps/wishlist/settings");
        if (res.ok) {
          const json = (await res.json()) as any;
          if (active) {
            setIsInstalled(json.data !== null);
          }
        } else if (active) {
          setIsInstalled(false);
        }
      } catch {
        if (active) setIsInstalled(false);
      }
    }
    checkApp();
    return () => {
      active = false;
    };
  }, []);

  if (isInstalled === null) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-pulse space-y-6">
        <div className="h-6 w-48 bg-[var(--theme-surface,#F4F4F5)] rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-[var(--theme-surface,#F4F4F5)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!isInstalled) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-12 text-center rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm font-[family-name:var(--theme-font-body)]">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">Wishlist app is not installed</h3>
        <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1 mb-6 max-w-sm mx-auto">
          Wishlist app is not installed. Install from /admin/apps to enable saving items.
        </p>
        <Link href="/admin/apps">
          <Button variant="primary" size="md">
            Install from /admin/apps &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <WishlistPage />
    </div>
  );
}
