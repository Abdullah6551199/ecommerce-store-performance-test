"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const WishlistPage = dynamic(() => import("@/apps/wishlist/storefront/WishlistPage"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-purple-100 dark:bg-purple-950/40 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-3xl bg-purple-100/50 dark:bg-purple-950/40" />
        ))}
      </div>
    </div>
  ),
});

export default function AccountWishlistPage(): React.JSX.Element {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    async function checkApp() {
      try {
        const res = await fetch("/api/apps/wishlist/settings");
        if (res.ok) {
          const json = (await res.json()) as any;
          if (active) {
            // When app is uninstalled or disabled, json.data is null
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
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-purple-100 dark:bg-purple-950/40 rounded-xl" />
        <div className="h-64 rounded-3xl bg-purple-100/50 dark:bg-purple-950/40" />
      </div>
    );
  }

  if (!isInstalled) {
    return (
      <div className="p-12 text-center rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 mb-4">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-[#3C0561] dark:text-white">Wishlist app is not installed</h3>
        <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1 mb-6 max-w-sm mx-auto">
          Wishlist app is not installed. Install from /admin/apps to enable saving items.
        </p>
        <Link
          href="/admin/apps"
          className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Install from /admin/apps &rarr;
        </Link>
      </div>
    );
  }

  return <WishlistPage />;
}
