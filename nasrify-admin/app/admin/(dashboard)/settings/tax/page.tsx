"use client";

import React from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const TaxManager = dynamic(
  () => import("@/components/admin/TaxManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Tax Settings..." /> }
);

export default function AdminTaxPage(): React.JSX.Element {
  return <TaxManager />;
}
