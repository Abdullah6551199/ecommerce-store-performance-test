"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CustomerUser {
  id: string;
  name: string;
  email: string;
}

export default function AccountNavButton(): React.JSX.Element {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch authenticated customer
  useEffect(() => {
    let isMounted = true;
    async function loadCustomer() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = (await res.json()) as { customer?: CustomerUser };
          if (data.customer && isMounted) {
            setCustomer(data.customer);
          }
        }
      } catch (_err) {
        // Unauthenticated or network error
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCustomer();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    try {
      setDropdownOpen(false);
      await fetch("/api/auth/logout", { method: "POST" });
      setCustomer(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 opacity-50">
        <svg className="h-4 w-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      </div>
    );
  }

  // If not logged in
  if (!customer) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-black dark:hover:text-white hover:border-[#18C729]/50 transition-all"
        title="Sign In to Your Account"
      >
        <svg className="h-4 w-4 text-[#18C729]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  // Logged in: show "Hi, [FirstName]" + dropdown
  const firstName = customer.name.trim().split(" ")[0] || "Customer";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-[#18C729]/30 bg-[#18C729]/10 text-xs font-bold text-zinc-900 dark:text-white hover:bg-[#18C729]/20 transition-all"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#18C729] text-[11px] font-black text-black">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline truncate max-w-[90px]">Hi, {firstName}</span>
        <svg
          className={`h-3 w-3 text-zinc-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#080e0a]/95 backdrop-blur-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-white/5 mb-1">
            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{customer.name}</p>
            <p className="text-[11px] text-zinc-500 truncate">{customer.email}</p>
          </div>

          <Link
            href="/account"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-[#18C729] transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>

          <Link
            href="/account/orders"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-[#18C729] transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            My Orders
          </Link>

          <Link
            href="/account/wishlist"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-[#18C729] transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Wishlist
          </Link>

          <Link
            href="/account/notifications"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-[#18C729] transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </Link>

          <div className="my-1 border-t border-zinc-100 dark:border-white/5" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
