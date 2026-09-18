"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistContext";
import { WishlistAppSettings, DEFAULT_WISHLIST_SETTINGS } from "../shared/types";

export interface WishlistHeaderIconProps {
  className?: string;
}

export default function WishlistHeaderIcon({
  className = "",
}: WishlistHeaderIconProps): React.JSX.Element | null {
  const { itemCount } = useWishlist();
  const [settings, setSettings] = useState<WishlistAppSettings>(DEFAULT_WISHLIST_SETTINGS);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchSettings() {
      try {
        const res = await fetch("/api/apps/wishlist/settings");
        if (res.ok) {
          const json = (await res.json()) as any;
          if (active) {
            if (json.data === null) {
              setIsEnabled(false);
            } else if (json.success && json.data) {
              setIsEnabled(true);
              setSettings({ ...DEFAULT_WISHLIST_SETTINGS, ...json.data });
            }
          }
        }
      } catch {
        // Silently catch
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    fetchSettings();
    return () => {
      active = false;
    };
  }, []);

  if (!isEnabled || (isLoaded && !settings.showInHeader)) {
    return null;
  }

  return (
    <div data-extension-point="storefront.header" data-app="wishlist" className="inline-flex">
      <Link
        href="/account/wishlist"
        id="wishlist-header-nav-btn"
        className={`group relative flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-xl border border-purple-300/60 dark:border-white/10 bg-white/50 dark:bg-white/5 px-2.5 py-1 transition-all hover:scale-105 hover:border-red-500/50 hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer shadow-sm ${className}`}
        aria-label={`Wishlist, ${itemCount} items`}
        title={`Wishlist (${itemCount} items)`}
      >
        <div className="relative flex items-center justify-center">
          <svg
            className={`h-4 w-4 transition-colors ${
              itemCount > 0
                ? "text-red-500 fill-red-500 group-hover:text-red-600"
                : "text-[#3C0561] dark:text-white group-hover:text-red-500"
            }`}
            fill={itemCount > 0 ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            />
          </svg>
          {itemCount > 0 && (
            <span
              id="wishlist-header-count-badge"
              className="absolute -top-2 -right-3.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-md animate-pulse"
            >
              {itemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-[#3C0561] dark:text-white/60 group-hover:text-red-500 leading-tight mt-0.5 tracking-tight transition-colors">
          Wishlist
        </span>
      </Link>
    </div>
  );
}
