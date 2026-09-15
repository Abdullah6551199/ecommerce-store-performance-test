"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const MediaManager = dynamic(
  () => import("@/components/admin/MediaManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Media Library..." /> }
);

export default function AdminMediaPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Media Library - Admin Panel";
  }, []);

  return <MediaManager />;
}
