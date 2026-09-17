"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const CouponsManager = dynamic(
  () => import("@/components/admin/CouponsManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Coupons..." /> }
);

export default function AdminCouponsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Discount Coupons & Promotions - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Coupons">
      <CouponsManager />
    </AdminErrorBoundary>
  );
}
