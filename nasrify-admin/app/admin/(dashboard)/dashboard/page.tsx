"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const DashboardOverviewManager = dynamic(
  () => import("@/components/admin/DashboardOverviewManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Dashboard Metrics..." /> }
);

export default function AdminDashboardPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Operations Dashboard - Admin Panel";
  }, []);

  return <DashboardOverviewManager />;
}
