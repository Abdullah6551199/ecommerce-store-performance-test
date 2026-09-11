"use client";

import React, { useEffect } from "react";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default function AdminCategoriesPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Categories Management - Admin Panel";
  }, []);

  return <CategoriesManager />;
}
