import React from "react";
import ProductsManager from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Product Catalog - Admin Panel",
  description: "Create, manage, duplicate, and configure catalog products, pricing, and R2 media.",
};

export default function AdminProductsPage(): React.JSX.Element {
  return <ProductsManager />;
}
