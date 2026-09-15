"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const AnalyticsDashboard = dynamic(
  () => import("@/components/admin/analytics/AnalyticsDashboard"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Analytics..." /> }
);

export default function AdminAnalyticsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Analytics & Smart Insights - Admin Panel";
  }, []);

  return <AnalyticsDashboard />;
}
