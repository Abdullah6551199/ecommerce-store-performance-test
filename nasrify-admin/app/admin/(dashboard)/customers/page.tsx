"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const CustomersManager = dynamic(
  () => import("@/components/admin/CustomersManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Customers..." /> }
);

export default function AdminCustomersPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Customers Directory - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Customers Directory">
      <CustomersManager />
    </AdminErrorBoundary>
  );
}
