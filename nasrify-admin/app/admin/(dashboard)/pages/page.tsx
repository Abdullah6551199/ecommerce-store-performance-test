"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const PagesManager = dynamic(
  () => import("@/components/admin/pages/PagesManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Content CMS..." /> }
);

export default function AdminPagesCMS(): React.JSX.Element {
  useEffect(() => {
    document.title = "Pages & Content CMS - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Pages & Content CMS">
      <PagesManager />
    </AdminErrorBoundary>
  );
}
