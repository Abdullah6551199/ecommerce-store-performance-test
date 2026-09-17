"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const CategoriesManager = dynamic(
  () => import("@/components/admin/CategoriesManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Categories..." /> }
);

export default function AdminCategoriesPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Categories Management - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Categories">
      <CategoriesManager />
    </AdminErrorBoundary>
  );
}
