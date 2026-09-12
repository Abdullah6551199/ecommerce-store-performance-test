"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  wishlistCount: number;
  reviewsCount: number;
}

interface OrderSummary {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
}

interface NotificationSummary {
  id: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
}

function getStatusBadge(status: string) {
  const norm = status.toLowerCase();
  switch (norm) {
    case "delivered":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "shipped":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "processing":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "confirmed":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
  }
}

export default function AccountDashboardPage(): React.JSX.Element {
  const [customerName, setCustomerName] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    reviewsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<NotificationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [meRes, ordersRes, notifsRes, wishlistRes, reviewsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/customer/orders?limit=3"),
          fetch("/api/customer/notifications?limit=3"),
          fetch("/api/customer/wishlist"),
          fetch("/api/customer/reviews"),
        ]);

        if (meRes.ok) {
          const meData = (await meRes.json()) as { customer?: { name?: string } };
          setCustomerName(meData.customer?.name || "Valued Customer");
        }

        let ordersCount = 0;
        let totalSpent = 0;
        if (ordersRes.ok) {
          const ordersData = (await ordersRes.json()) as { orders?: OrderSummary[]; total?: number };
          setRecentOrders(ordersData.orders || []);
          ordersCount = ordersData.total || 0;
          totalSpent = (ordersData.orders || []).reduce(
            (acc: number, o: OrderSummary) => acc + (Number(o.total) || 0),
            0
          );
        }

        if (notifsRes.ok) {
          const notifsData = (await notifsRes.json()) as { notifications?: NotificationSummary[] };
          setRecentNotifications(notifsData.notifications || []);
        }

        let wishlistCount = 0;
        if (wishlistRes.ok) {
          const wData = (await wishlistRes.json()) as { items?: unknown[] };
          wishlistCount = (wData.items || []).length;
        }

        let reviewsCount = 0;
        if (reviewsRes.ok) {
          const rData = (await reviewsRes.json()) as { reviews?: unknown[] };
          reviewsCount = (rData.reviews || []).length;
        }

        setStats({
          totalOrders: ordersCount,
          totalSpent,
          wishlistCount,
          reviewsCount,
        });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-3xl bg-zinc-200 dark:bg-white/5 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-[#18C729]/10 via-zinc-100 to-transparent dark:from-[#18C729]/15 dark:via-[#080e0a] dark:to-[#080e0a] relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-[#18C729]/20 text-xs font-bold text-emerald-700 dark:text-[#18C729] mb-3">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Welcome back, {customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            Track your deliveries, review past purchases, manage shipping addresses, and explore saved favorites all from your account.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-[#18C729] text-black font-bold text-xs hover:bg-[#15af24] shadow-md shadow-[#18C729]/20 transition"
            >
              Browse Store &rarr;
            </Link>
            <Link
              href="/account/orders"
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-zinc-800 dark:text-white font-bold text-xs hover:border-[#18C729] transition"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Orders</p>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {stats.totalOrders}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Spent</p>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            Rs. {stats.totalSpent.toLocaleString()}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Wishlist Items</p>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {stats.wishlistCount}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">My Reviews</p>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {stats.reviewsCount}
          </p>
        </div>
      </div>

      {/* Two-Column Section: Recent Orders & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-[#18C729] hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              You haven&apos;t placed any orders yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5 hover:border-zinc-300 dark:hover:border-white/20 transition"
                >
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {order.itemCount} items &bull; Rs. {Number(order.total).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
              Latest Notifications
            </h2>
            <Link
              href="/account/notifications"
              className="text-xs font-bold text-[#18C729] hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No recent notifications.
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || "/account/notifications"}
                  className="block p-3.5 rounded-2xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5 hover:border-zinc-300 dark:hover:border-white/20 transition"
                >
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {notif.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    {notif.message}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
