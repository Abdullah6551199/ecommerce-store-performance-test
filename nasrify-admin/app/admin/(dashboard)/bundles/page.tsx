"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const BundlesManager = dynamic(
  () => import("@/components/admin/BundlesManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Product Bundles..." /> }
);

export default function AdminBundlesPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Product Bundles - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Product Bundles">
      <BundlesManager />
    </AdminErrorBoundary>
  );
}
