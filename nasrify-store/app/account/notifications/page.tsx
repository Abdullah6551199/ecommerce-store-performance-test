"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/themes/blocks/Button";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "order_status":
      return (
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-primary,#25D366)] shrink-0 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </span>
      );
    case "review_approved":
      return (
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-primary,#25D366)] shrink-0 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </span>
      );
    case "coupon":
      return (
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-primary,#25D366)] shrink-0 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </span>
      );
    default:
      return (
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-primary,#25D366)] shrink-0 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </span>
      );
  }
}

export default function AccountNotificationsPage(): React.JSX.Element {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(
    async (targetPage = page, targetFilter = filter) => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/customer/notifications?page=${targetPage}&limit=20&filter=${targetFilter}`
        );
        if (res.ok) {
          const data = (await res.json()) as {
            notifications?: NotificationItem[];
            total?: number;
            unreadCount?: number;
            totalPages?: number;
          };
          setNotifications(data.notifications || []);
          setTotal(data.total || 0);
          setUnreadCount(data.unreadCount || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, filter]
  );

  useEffect(() => {
    fetchNotifications(page, filter);
  }, [fetchNotifications, page, filter]);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/customer/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/customer/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/customer/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const handleClearRead = async () => {
    if (!confirm("Clear all read notifications?")) return;
    try {
      await fetch("/api/customer/notifications/clear-read", { method: "DELETE" });
      fetchNotifications(1, filter);
    } catch (err) {
      console.error("Clear read error:", err);
    }
  };

  return (
    <div className="space-y-6 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-[var(--theme-text,#18181B)] tracking-tight font-[family-name:var(--theme-font-heading)]">
            Notification Center
          </h1>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-0.5">
            Real-time updates regarding order status, tracking, and account security ({total} total)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleMarkAllRead}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearRead}
          >
            Clear Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] max-w-xs">
        {(["all", "unread", "read"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setFilter(tab);
              setPage(1);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black capitalize transition cursor-pointer ${
              filter === tab
                ? "bg-[var(--theme-primary,#25D366)] text-white shadow-sm"
                : "text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)]"
            }`}
          >
            {tab} {tab === "unread" && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--theme-surface,#F4F4F5)] animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text-muted,#71717A)] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            No {filter !== "all" ? filter : ""} Notifications
          </h3>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1">
            You&apos;re completely up to date. New updates will be logged here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl border transition shadow-sm flex items-start gap-4 ${
                !notif.isRead
                  ? "border-[var(--theme-primary,#25D366)] bg-white ring-1 ring-[var(--theme-primary,#25D366)]/20"
                  : "border-[var(--theme-border,#E4E4E7)] bg-white"
              }`}
            >
              {getNotificationIcon(notif.type)}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="text-xs sm:text-sm font-black text-[var(--theme-text,#18181B)] truncate font-[family-name:var(--theme-font-heading)]">
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-[var(--theme-text-muted,#71717A)]">
                    {new Date(notif.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs text-[var(--theme-text-muted,#71717A)] leading-relaxed mb-3">
                  {notif.message}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--theme-border,#E4E4E7)] text-xs">
                  <div>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={() => {
                          if (!notif.isRead) handleMarkRead(notif.id);
                        }}
                        className="font-bold text-[var(--theme-primary,#25D366)] hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <span>&rarr;</span>
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notif.id)}
                        className="font-bold text-[var(--theme-primary,#25D366)] hover:underline cursor-pointer"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(notif.id)}
                      className="font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &larr; Previous
              </Button>
              <span className="text-xs font-bold text-[var(--theme-text-muted,#71717A)]">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next &rarr;
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
