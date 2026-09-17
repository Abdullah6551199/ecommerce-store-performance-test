"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const TaxManager = dynamic(
  () => import("@/components/admin/TaxManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Tax Settings..." /> }
);

export default function AdminTaxPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Tax Rates & Settings - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Tax Settings">
      <TaxManager />
    </AdminErrorBoundary>
  );
}
