"use client";

import React, { useEffect } from "react";
import ProductsManager from "@/components/admin/ProductsManager";

export default function AdminProductsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Product Catalog - Admin Panel";
  }, []);

  return <ProductsManager />;
}
