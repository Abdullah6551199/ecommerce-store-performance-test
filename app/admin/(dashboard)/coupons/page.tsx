"use client";

import React from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const CouponsManager = dynamic(
  () => import("@/components/admin/CouponsManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Coupons..." /> }
);

export default function AdminCouponsPage(): React.JSX.Element {
  return <CouponsManager />;
}
