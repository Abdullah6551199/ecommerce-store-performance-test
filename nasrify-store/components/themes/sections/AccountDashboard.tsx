"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SectionProps } from "@/lib/themes/types";
import Button from "../blocks/Button";
import Badge from "../blocks/Badge";
import { useCart } from "@/components/CartContext";

export interface AccountDashboardSettings {
  show_stats?: boolean;
  show_recent_orders?: boolean;
  show_notifications?: boolean;
}

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

export default function AccountDashboard({
  settings = {},
  storeData,
}: SectionProps<AccountDashboardSettings>) {
  const [customerName, setCustomerName] = useState(storeData?.customerName || "");
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
        <div className="h-36 rounded-2xl bg-[var(--theme-surface,#F4F4F5)] animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[var(--theme-surface,#F4F4F5)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-[var(--theme-border,#E4E4E7)] text-xs font-black text-[var(--theme-primary,#25D366)] mb-3">
            Account Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--theme-text,#18181B)] tracking-tight font-[family-name:var(--theme-font-heading)]">
            Welcome back, {customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--theme-text-muted,#71717A)] mt-1 max-w-xl leading-relaxed">
            Track active shipments, manage delivery addresses, inspect past orders, and review saved wishlist favorites all in one place.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link href="/shop">
              <Button variant="primary" size="sm">
                Browse Store &rarr;
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openDrawer}
            >
              View Cart
            </Button>
            <Link href="/account/orders">
              <Button variant="secondary" size="sm">
                View All Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      {settings.show_stats !== false && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 sm:p-6 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm">
            <p className="text-xs font-bold text-[var(--theme-text-muted,#71717A)] uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl sm:text-3xl font-black text-[var(--theme-text,#18181B)] mt-1 font-mono">
              {stats.totalOrders}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm">
            <p className="text-xs font-bold text-[var(--theme-text-muted,#71717A)] uppercase tracking-wider">Total Spent</p>
            <p className="text-2xl sm:text-3xl font-black text-[var(--theme-primary,#25D366)] mt-1 font-mono">
              ${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm">
            <p className="text-xs font-bold text-[var(--theme-text-muted,#71717A)] uppercase tracking-wider">Wishlist Items</p>
            <p className="text-2xl sm:text-3xl font-black text-[var(--theme-text,#18181B)] mt-1 font-mono">
              {stats.wishlistCount}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm">
            <p className="text-xs font-bold text-[var(--theme-text-muted,#71717A)] uppercase tracking-wider">My Reviews</p>
            <p className="text-2xl sm:text-3xl font-black text-[var(--theme-text,#18181B)] mt-1 font-mono">
              {stats.reviewsCount}
            </p>
          </div>
        </div>
      )}

      {/* Two-Column Section: Recent Orders & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        {settings.show_recent_orders !== false && (
          <div className="p-6 sm:p-7 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--theme-border,#E4E4E7)]">
              <h2 className="text-base font-extrabold text-[var(--theme-text,#18181B)] flex items-center gap-2 font-[family-name:var(--theme-font-heading)]">
                <span>📦</span>
                <span>Recent Orders</span>
              </h2>
              <Link
                href="/account/orders"
                className="text-xs font-bold text-[var(--theme-primary,#25D366)] hover:underline"
              >
                View All &rarr;
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-10 text-center text-xs text-[var(--theme-text-muted,#71717A)]">
                You haven&apos;t placed any orders yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)]/50 hover:border-[var(--theme-primary,#25D366)] transition"
                  >
                    <div>
                      <p className="text-xs font-black text-[var(--theme-text,#18181B)]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-[var(--theme-text-muted,#71717A)] mt-0.5">
                        {order.itemCount} items &bull; ${Number(order.total).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Badge
                        text={order.status}
                        variant={order.status.toLowerCase() === "delivered" ? "new" : "secondary"}
                        size="sm"
                      />
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="p-1.5 rounded-lg border border-[var(--theme-border,#E4E4E7)] text-[var(--theme-text,#18181B)] hover:bg-white transition"
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
        )}

        {/* Recent Notifications */}
        {settings.show_notifications !== false && (
          <div className="p-6 sm:p-7 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--theme-border,#E4E4E7)]">
              <h2 className="text-base font-extrabold text-[var(--theme-text,#18181B)] flex items-center gap-2 font-[family-name:var(--theme-font-heading)]">
                <span>🔔</span>
                <span>Latest Notifications</span>
              </h2>
              <Link
                href="/account/notifications"
                className="text-xs font-bold text-[var(--theme-primary,#25D366)] hover:underline"
              >
                View All &rarr;
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-[var(--theme-text-muted,#71717A)]">
                No recent notifications.
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link || "/account/notifications"}
                    className="block p-4 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)]/50 hover:border-[var(--theme-primary,#25D366)] transition"
                  >
                    <p className="text-xs font-black text-[var(--theme-text,#18181B)] truncate">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-[var(--theme-text-muted,#71717A)] line-clamp-1 mt-0.5">
                      {notif.message}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
