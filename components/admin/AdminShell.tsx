"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminSidebarProps {
  userEmail: string;
  userRole: string;
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    name: "Coupons",
    href: "/admin/coupons",
    icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    name: "Media",
    href: "/admin/media",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    name: "Homepage",
    href: "/admin/homepage",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  },
  {
    name: "Pages",
    href: "/admin/pages",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    name: "Appearance",
    href: "/admin/appearance",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
];

export default function AdminShell({
  userEmail,
  userRole,
  children,
}: AdminSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#080e0a] text-zinc-900 dark:text-white selection:bg-[#FEF500] selection:text-black transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] transition-all duration-300 md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-white/10 px-6">
          <Link
            href="/admin/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-md shadow-[#18C729]/20">
              <svg
                className="h-5 w-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="block font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                Store Admin
              </span>
              <span className="block text-[10px] text-zinc-500 dark:text-white/50 font-mono tracking-wider">
                STAGE 13 ANALYTICS
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-zinc-500 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white md:hidden"
            aria-label="Close navigation"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border border-[#18C729]/40 bg-[#18C729]/15 text-emerald-800 dark:text-white font-semibold shadow-sm shadow-[#18C729]/10"
                    : "text-zinc-600 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <svg
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-[#18C729]" : "text-zinc-400 dark:text-white/50 group-hover:text-[#18C729]"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.2 : 1.75}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#18C729] shadow-sm shadow-[#18C729]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="border-t border-zinc-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-zinc-100 dark:bg-white/5 p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#18C729]/20 text-xs font-bold text-[#18C729]">
              {(userEmail || "A")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-900 dark:text-white">{userEmail}</p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#18C729]" />
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-600 dark:text-[#FEF500]">
                  {userRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0c140f]/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-zinc-600 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white md:hidden"
              aria-label="Open navigation drawer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span className="text-sm font-semibold text-zinc-700 dark:text-white/70 hidden sm:inline">
              Admin Portal
            </span>
            <span className="h-4 w-[1px] bg-zinc-300 dark:bg-white/20 hidden sm:inline" />
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#18C729] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#18C729]">
                Live Database Connected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle for Admin Panel */}
            <ThemeToggle storageKey="apex_admin_theme" />

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-white/70 transition-colors hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
            >
              <span>View Storefront</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
