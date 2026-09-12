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
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const [meRes, unreadRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/customer/notifications/unread-count"),
        ]);

        if (!meRes.ok) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        const meData = (await meRes.json()) as { customer?: CustomerProfile };
        const unreadData = (await unreadRes.json().catch(() => ({ unreadCount: 0 }))) as { unreadCount?: number };

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
      name: "My Reviews",
      href: "/account/reviews",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      name: "Saved Addresses",
      href: "/account/addresses",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
    {
      name: "Profile Settings",
      href: "/account/profile",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md">
          <svg className="w-5 h-5 animate-spin text-[#18C729]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Loading your customer account...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Mobile Account Navigation Trigger */}
      <div className="lg:hidden mb-6 flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm">
        <div>
          <p className="text-xs text-zinc-500">Logged in as</p>
          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
            {customer?.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:border-[#18C729]"
        >
          <span>Account Menu</span>
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
        <div className="lg:hidden mb-6 p-2 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-xl space-y-1 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#18C729] text-black font-bold shadow-md shadow-[#18C729]/20"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {link.icon}
                  {link.name}
                </span>
                {Boolean(link.badge) && link.badge! > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-[10px] font-black text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-100 dark:border-white/5">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24">
          <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl p-5 shadow-sm space-y-6">
            {/* User Profile Summary */}
            <div className="flex items-center gap-3 pb-5 border-b border-zinc-200 dark:border-white/10">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18C729] to-[#FEF500] text-black font-black text-sm shadow-md shadow-[#18C729]/20">
                {customer?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">
                  {customer?.name}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">{customer?.email}</p>
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-[#18C729] text-black font-bold shadow-md shadow-[#18C729]/20"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {link.icon}
                      {link.name}
                    </span>
                    {Boolean(link.badge) && link.badge! > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-[10px] font-black text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sign Out */}
            <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
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
