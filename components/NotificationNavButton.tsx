"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "order_status":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </span>
      );
    case "review_approved":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </span>
      );
    case "coupon":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </span>
      );
    default:
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#18C729]/10 text-[#18C729]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </span>
      );
  }
}

export default function NotificationNavButton(): React.JSX.Element {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Poll unread count every 30 seconds
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/notifications/unread-count");
      if (res.ok) {
        const data = (await res.json()) as { unreadCount?: number; authenticated?: boolean };
        setUnreadCount(data.unreadCount || 0);
        setIsAuthenticated(Boolean(data.authenticated));
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      // Ignore background network error
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Load preview list when opened
  const loadRecentNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await fetch("/api/customer/notifications?limit=5");
      if (res.ok) {
        const data = (await res.json()) as {
          notifications?: NotificationItem[];
          unreadCount?: number;
        };
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleToggle = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/account/notifications");
      return;
    }
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      loadRecentNotifications();
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      if (!notif.isRead) {
        await fetch(`/api/customer/notifications/${notif.id}/read`, { method: "PUT" });
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      }
    } catch {}
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    } else {
      router.push("/account/notifications");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/customer/notifications/read-all", { method: "PUT" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white hover:border-[#18C729]/40 transition-all"
        title="Notifications"
        aria-label={`Notifications, ${unreadCount} unread`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-[#080e0a] animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#18C729]/20 px-2 py-0.5 text-[10px] font-bold text-[#18C729]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#18C729] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-white/5">
            {loading ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                <svg className="w-5 h-5 mx-auto mb-2 animate-spin text-[#18C729]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 p-3 text-left transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 ${
                    !notif.isRead ? "bg-[#18C729]/5 dark:bg-[#18C729]/5" : ""
                  }`}
                >
                  <div className="shrink-0 mt-0.5">{getNotificationIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-[#18C729] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5 text-center">
            <Link
              href="/account/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full py-1.5 text-xs font-bold text-[#18C729] hover:underline"
            >
              View All Notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
