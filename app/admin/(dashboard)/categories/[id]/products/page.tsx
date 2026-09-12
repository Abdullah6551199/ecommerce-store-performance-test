import React from "react";
import CategoryProductsManager from "@/components/admin/CategoryProductsManager";

export const dynamic = "force-dynamic";

interface CategoryProductsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryProductsPage({
  params,
}: CategoryProductsPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  return <CategoryProductsManager categoryId={id} />;
}
