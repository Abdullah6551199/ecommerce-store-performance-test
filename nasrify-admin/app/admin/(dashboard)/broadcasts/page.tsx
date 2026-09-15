"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const BroadcastManager = dynamic(
  () => import("@/components/admin/BroadcastManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Broadcasts..." /> }
);

export default function AdminBroadcastsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Broadcast Notifications - Admin Panel";
  }, []);

  return <BroadcastManager />;
}
