"use client";

import React, { useEffect } from "react";
import AnalyticsDashboard from "@/components/admin/analytics/AnalyticsDashboard";

export default function AdminAnalyticsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Analytics & Smart Insights - Admin Panel";
  }, []);

  return <AnalyticsDashboard />;
}
