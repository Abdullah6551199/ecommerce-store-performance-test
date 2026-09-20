"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const ProductQAManager = dynamic(
  () => import("@/apps/product-qa/admin/ProductQAManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Product Q&A..." /> }
);

export default function AdminProductQAPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Product Q&A - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Product Q&A">
      <ProductQAManager />
    </AdminErrorBoundary>
  );
}
