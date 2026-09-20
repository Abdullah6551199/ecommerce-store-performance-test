"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const DigitalProductsManager = dynamic(
  () => import("@/apps/digital-products/admin/DigitalProductsManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Digital Products..." /> }
);

export default function AdminDigitalProductsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Digital Products - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Digital Products">
      <DigitalProductsManager />
    </AdminErrorBoundary>
  );
}
