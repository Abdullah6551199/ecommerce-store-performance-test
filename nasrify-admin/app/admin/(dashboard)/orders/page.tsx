"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const OrdersManager = dynamic(
  () => import("@/components/admin/OrdersManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Orders..." /> }
);

export default function AdminOrdersPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Orders & Fulfillment - Admin Panel";
  }, []);

  return <OrdersManager />;
}
