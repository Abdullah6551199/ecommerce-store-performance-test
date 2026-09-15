"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

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
      return "bg-purple-100 text-[#960DF2] dark:bg-purple-900/60 dark:text-[#EACFFC] border-purple-300 dark:border-purple-700";
    case "shipped":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    case "processing":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "confirmed":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "cancelled":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
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

  const { openDrawer } = useCart();

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
        <div className="h-36 rounded-3xl bg-purple-100/50 dark:bg-purple-950/40 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-purple-100/40 dark:bg-purple-950/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-purple-100 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-purple-100/40 to-transparent dark:from-[#2A0344] dark:via-[#1E0230] dark:to-[#1E0230] relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-xs font-black text-[#960DF2] dark:text-[#EACFFC] mb-3">
            Account Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3C0561] dark:text-white tracking-tight">
            Welcome back, {customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-purple-700/80 dark:text-purple-300/80 mt-1 max-w-xl leading-relaxed">
            Track active shipments, manage delivery addresses, inspect past orders, and review saved wishlist favorites all in one place.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Store &rarr;
            </Link>
            <button
              type="button"
              onClick={openDrawer}
              className="px-5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#1E0230] text-[#3C0561] dark:text-white font-bold text-xs hover:border-[#960DF2] hover:text-[#960DF2] transition"
            >
              View Cart
            </button>
            <Link
              href="/account/orders"
              className="px-5 py-2.5 rounded-xl border border-purple-200/80 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 text-[#960DF2] dark:text-[#EACFFC] font-bold text-xs hover:bg-purple-100/60 transition"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-purple-300/80 uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl sm:text-3xl font-black text-[#3C0561] dark:text-white mt-1">
            {stats.totalOrders}
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-purple-300/80 uppercase tracking-wider">Total Spent</p>
          <p className="text-2xl sm:text-3xl font-black text-[#960DF2] dark:text-[#EACFFC] mt-1">
            Rs. {stats.totalSpent.toLocaleString()}
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-purple-300/80 uppercase tracking-wider">Wishlist Items</p>
          <p className="text-2xl sm:text-3xl font-black text-[#3C0561] dark:text-white mt-1">
            {stats.wishlistCount}
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-purple-300/80 uppercase tracking-wider">My Reviews</p>
          <p className="text-2xl sm:text-3xl font-black text-[#3C0561] dark:text-white mt-1">
            {stats.reviewsCount}
          </p>
        </div>
      </div>

      {/* Two-Column Section: Recent Orders & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="p-6 sm:p-7 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/40">
            <h2 className="text-base font-extrabold text-[#3C0561] dark:text-white flex items-center gap-2">
              <span>📦</span>
              <span>Recent Orders</span>
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-[#960DF2] dark:text-[#C06EF7] hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-purple-300/70">
              You haven&apos;t placed any orders yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-purple-50/40 dark:bg-[#2A0344]/50 hover:border-[#960DF2] transition"
                >
                  <div>
                    <p className="text-xs font-black text-[#3C0561] dark:text-white">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-purple-300/80 mt-0.5">
                      {order.itemCount} items &bull; Rs. {Number(order.total).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="p-1.5 rounded-lg border border-purple-200 dark:border-purple-700 text-[#960DF2] dark:text-[#EACFFC] hover:bg-white dark:hover:bg-[#1E0230] transition"
                      title="View Details"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="p-6 sm:p-7 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/40">
            <h2 className="text-base font-extrabold text-[#3C0561] dark:text-white flex items-center gap-2">
              <span>🔔</span>
              <span>Latest Notifications</span>
            </h2>
            <Link
              href="/account/notifications"
              className="text-xs font-bold text-[#960DF2] dark:text-[#C06EF7] hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-purple-300/70">
              No recent notifications.
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || "/account/notifications"}
                  className="block p-4 rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-purple-50/40 dark:bg-[#2A0344]/50 hover:border-[#960DF2] transition"
                >
                  <p className="text-xs font-black text-[#3C0561] dark:text-white truncate">
                    {notif.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-purple-300/80 line-clamp-1 mt-0.5">
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
