"use client";

import React from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const BundlesManager = dynamic(
  () => import("@/apps/bundles/admin/BundlesManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Product Bundles..." /> }
);

export default function AdminBundlesPage(): React.JSX.Element {
  return <BundlesManager />;
}
