"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasWishlistApp, setHasWishlistApp] = useState(true);
  const [hasOrderTrackingApp, setHasOrderTrackingApp] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const [meRes, unreadRes, wishlistRes, trackingRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/customer/notifications/unread-count"),
          fetch("/api/apps/wishlist/settings").catch(() => null),
          fetch("/api/apps/order-tracking/settings").catch(() => null),
        ]);

        if (!meRes.ok) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        const meData = (await meRes.json()) as { customer?: CustomerProfile };
        const unreadData = (await unreadRes.json().catch(() => ({ unreadCount: 0 }))) as { unreadCount?: number };

        if (wishlistRes && wishlistRes.ok) {
          const wJson = (await wishlistRes.json().catch(() => ({}))) as any;
          if (wJson.data === null) {
            if (isMounted) setHasWishlistApp(false);
          } else if (isMounted) {
            setHasWishlistApp(true);
          }
        }

        if (trackingRes && trackingRes.ok) {
          const tJson = (await trackingRes.json().catch(() => ({}))) as any;
          if (tJson.data === null) {
            if (isMounted) setHasOrderTrackingApp(false);
          } else if (isMounted) {
            setHasOrderTrackingApp(true);
          }
        }

        if (isMounted && meData.customer) {
          setCustomer(meData.customer);
          setUnreadCount(unreadData.unreadCount || 0);
          setIsLoading(false);
        }
      } catch (_err) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const navLinks = [
    {
      name: "Dashboard",
      href: "/account",
      exact: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Orders",
      href: "/account/orders",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      name: "Wishlist",
      href: "/account/wishlist",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      name: "Reviews",
      href: "/account/reviews",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      name: "Addresses",
      href: "/account/addresses",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      name: "Profile",
      href: "/account/profile",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: "Track Order",
      href: "/track-order",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
    {
      name: "Notifications",
      href: "/account/notifications",
      badge: unreadCount,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ].filter(
    (link) =>
      (link.href !== "/account/wishlist" || hasWishlistApp) &&
      (link.href !== "/track-order" || hasOrderTrackingApp)
  );

  const getSubPageName = () => {
    if (pathname.startsWith("/account/orders")) return "Orders";
    if (pathname.startsWith("/account/wishlist")) return "Wishlist";
    if (pathname.startsWith("/account/reviews")) return "Reviews";
    if (pathname.startsWith("/account/addresses")) return "Addresses";
    if (pathname.startsWith("/account/profile")) return "Profile";
    if (pathname.startsWith("/account/notifications")) return "Notifications";
    return "";
  };

  const subPageName = getSubPageName();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white/90 dark:bg-[#1E0230] shadow-sm">
          <svg className="w-5 h-5 animate-spin text-[#960DF2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-xs font-bold text-[#3C0561] dark:text-[#EACFFC]">
            Loading customer account...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Breadcrumbs & Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-purple-200/60 dark:border-purple-900/40">
        <div>
          <nav className="flex items-center text-xs text-zinc-500 dark:text-purple-300/70 space-x-2">
            <Link href="/" className="hover:text-[#960DF2] dark:hover:text-[#EACFFC] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/account" className="hover:text-[#960DF2] dark:hover:text-[#EACFFC] transition-colors">
              My Account
            </Link>
            {subPageName && (
              <>
                <span>/</span>
                <span className="text-[#3C0561] dark:text-white font-bold">{subPageName}</span>
              </>
            )}
          </nav>
          <h1 className="text-xl sm:text-2xl font-black text-[#3C0561] dark:text-white tracking-tight mt-1">
            My Account
          </h1>
        </div>

        <div className="text-xs text-zinc-500 dark:text-purple-300/80">
          Signed in as <strong className="text-[#3C0561] dark:text-white">{customer?.email}</strong>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Trigger */}
      <div className="lg:hidden flex items-center justify-between p-4 rounded-2xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-[#1E0230] shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#960DF2] to-[#AB3DF5] text-white font-black text-xs shadow-md shadow-purple-500/20 shrink-0">
            {customer?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#3C0561] dark:text-white truncate">
              {customer?.name}
            </p>
            <p className="text-[10px] text-purple-600/80 dark:text-purple-300/70 truncate">{customer?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700 text-xs font-bold text-[#960DF2] dark:text-[#EACFFC] hover:border-purple-400"
        >
          <span>Menu</span>
          <svg
            className={`w-4 h-4 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-3 rounded-2xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-[#1E0230] shadow-xl space-y-1 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-[#960DF2] text-white shadow-md shadow-purple-600/20"
                    : "text-zinc-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {link.icon}
                  {link.name}
                </span>
                {Boolean(link.badge) && link.badge! > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#960DF2] text-[10px] font-black text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-purple-100 dark:border-purple-800/60">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24">
          <div className="rounded-3xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-[#1E0230] p-5 shadow-sm space-y-6">
            {/* User Profile Summary */}
            <div className="flex items-center gap-3 pb-5 border-b border-purple-100 dark:border-purple-800/60">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#960DF2] to-[#AB3DF5] text-white font-black text-sm shadow-md shadow-purple-500/25">
                {customer?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-[#3C0561] dark:text-white truncate">
                  {customer?.name}
                </p>
                <p className="text-[11px] text-purple-600/80 dark:text-purple-300/70 truncate">{customer?.email}</p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? "bg-[#960DF2] text-white shadow-md shadow-purple-600/25"
                        : "text-zinc-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-[#960DF2] dark:hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {link.icon}
                      {link.name}
                    </span>
                    {Boolean(link.badge) && link.badge! > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? "bg-white text-[#960DF2]" : "bg-[#960DF2] text-white"
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sign Out */}
            <div className="pt-4 border-t border-purple-100 dark:border-purple-800/60">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 min-w-0">{children}</main>
      </div>
    </div>
  );
}
