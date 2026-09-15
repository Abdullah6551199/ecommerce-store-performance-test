"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const ProductsManager = dynamic(
  () => import("@/components/admin/ProductsManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Products..." /> }
);

export default function AdminProductsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Product Catalog - Admin Panel";
  }, []);

  return <ProductsManager />;
}
