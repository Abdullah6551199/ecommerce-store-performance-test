"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionProps } from "@/lib/themes/types";
import Button from "../blocks/Button";
import Badge from "../blocks/Badge";

export interface AccountDashboardSettings {
  show_orders?: boolean;
  show_addresses?: boolean;
  show_profile?: boolean;
  layout?: "sidebar" | "tabs" | "cards";
}

export default function AccountDashboard({
  variant = "sidebar",
  settings = {},
  storeData,
}: SectionProps<AccountDashboardSettings>) {
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");

  const showOrders = settings.show_orders !== false;
  const showAddresses = settings.show_addresses !== false;
  const showProfile = settings.show_profile !== false;

  const mockUser = storeData?.account?.user || {
    name: "Zia Ur Rehman",
    email: "zia@example.com",
    joinedDate: "January 2026",
    address: {
      street: "123 Business Avenue, Suite 400",
      city: "Islamabad",
      country: "Pakistan",
      postalCode: "44000",
    },
  };

  const mockOrders = storeData?.account?.orders || [
    {
      id: "ORD-94821",
      date: "Sep 20, 2026",
      status: "Delivered",
      total: 249.0,
      itemsCount: 2,
    },
    {
      id: "ORD-93112",
      date: "Aug 14, 2026",
      status: "Processing",
      total: 119.5,
      itemsCount: 1,
    },
  ];

  return (
    <div className="w-full my-8 font-[family-name:var(--theme-font-body)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[var(--theme-border,#E4E4E7)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            My Account
          </h1>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1">
            Welcome back, {mockUser.name} ({mockUser.email})
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <Link href="/auth/signout">
            <Button size="sm" variant="outline">
              Sign Out
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 space-y-1">
          {showOrders && (
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              style={{
                borderRadius: "var(--theme-radius, 8px)",
                backgroundColor:
                  activeTab === "orders"
                    ? "var(--theme-primary-light, #DCFCE7)"
                    : "transparent",
                color:
                  activeTab === "orders"
                    ? "var(--theme-primary-dark, #1EA855)"
                    : "var(--theme-text, #18181B)",
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold cursor-pointer transition-colors"
            >
              📦 Order History
            </button>
          )}

          {showAddresses && (
            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              style={{
                borderRadius: "var(--theme-radius, 8px)",
                backgroundColor:
                  activeTab === "addresses"
                    ? "var(--theme-primary-light, #DCFCE7)"
                    : "transparent",
                color:
                  activeTab === "addresses"
                    ? "var(--theme-primary-dark, #1EA855)"
                    : "var(--theme-text, #18181B)",
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold cursor-pointer transition-colors"
            >
              📍 Shipping Addresses
            </button>
          )}

          {showProfile && (
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              style={{
                borderRadius: "var(--theme-radius, 8px)",
                backgroundColor:
                  activeTab === "profile"
                    ? "var(--theme-primary-light, #DCFCE7)"
                    : "transparent",
                color:
                  activeTab === "profile"
                    ? "var(--theme-primary-dark, #1EA855)"
                    : "var(--theme-text, #18181B)",
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold cursor-pointer transition-colors"
            >
              👤 Profile & Security
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="md:col-span-9">
          {activeTab === "orders" && showOrders && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[var(--theme-text,#18181B)]">
                Recent Orders
              </h2>

              <div className="divide-y divide-[var(--theme-border,#E4E4E7)] border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] overflow-hidden bg-white">
                {mockOrders.map((order: any) => (
                  <div key={order.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-[var(--theme-text,#18181B)]">
                        {order.id}
                      </span>
                      <p className="text-[var(--theme-text-muted,#71717A)]">
                        Placed on {order.date} • {order.itemsCount} items
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge
                        text={order.status}
                        variant={order.status === "Delivered" ? "new" : "secondary"}
                        size="sm"
                      />
                      <span className="font-bold text-[var(--theme-text,#18181B)]">
                        ${order.total.toFixed(2)}
                      </span>
                      <Button size="sm" variant="outline" className="!text-[11px] !py-1 !px-2">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "addresses" && showAddresses && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--theme-text,#18181B)]">
                  Saved Addresses
                </h2>
                <Button size="sm" variant="outline">
                  + Add Address
                </Button>
              </div>

              <div className="p-4 border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] bg-white text-xs space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[var(--theme-text,#18181B)]">
                    Default Address
                  </span>
                  <Badge text="Primary" variant="new" size="sm" />
                </div>
                <p className="text-[var(--theme-text,#18181B)]">{mockUser.name}</p>
                <p className="text-[var(--theme-text-muted,#71717A)]">{mockUser.address.street}</p>
                <p className="text-[var(--theme-text-muted,#71717A)]">
                  {mockUser.address.city}, {mockUser.address.postalCode}
                </p>
                <p className="text-[var(--theme-text-muted,#71717A)]">{mockUser.address.country}</p>
              </div>
            </div>
          )}

          {activeTab === "profile" && showProfile && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-base font-bold text-[var(--theme-text,#18181B)]">
                Profile Details
              </h2>
              <div className="p-5 border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] bg-white space-y-3 text-xs">
                <div>
                  <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={mockUser.name}
                    className="w-full px-3 py-2 border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--theme-text-muted,#71717A)] mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={mockUser.email}
                    disabled
                    className="w-full px-3 py-2 border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] bg-gray-50"
                  />
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="primary">
                    Update Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
