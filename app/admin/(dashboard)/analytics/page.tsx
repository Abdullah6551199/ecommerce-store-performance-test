import React from "react";
import AnalyticsDashboard from "@/components/admin/analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics & Smart Insights - Admin Panel",
  description: "Performance metrics, revenue analytics, customer telemetry, and predictive pattern insights.",
};

export default function AdminAnalyticsPage(): React.JSX.Element {
  return <AnalyticsDashboard />;
}
