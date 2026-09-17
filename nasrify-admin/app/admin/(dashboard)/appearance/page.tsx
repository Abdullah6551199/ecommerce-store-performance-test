"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const AppearanceManager = dynamic(
  () => import("@/components/admin/AppearanceManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Appearance..." /> }
);

export default function AdminAppearancePage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Appearance & Theme - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Appearance & Theme">
      <AppearanceManager />
    </AdminErrorBoundary>
  );
}
