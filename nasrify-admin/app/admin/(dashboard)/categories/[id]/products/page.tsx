"use client";

import React, { use } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const CategoryProductsManager = dynamic(
  () => import("@/components/admin/CategoryProductsManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Category Products..." /> }
);

interface CategoryProductsPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryProductsPage({
  params,
}: CategoryProductsPageProps): React.JSX.Element {
  const { id } = use(params);
  return <CategoryProductsManager categoryId={id} />;
}
