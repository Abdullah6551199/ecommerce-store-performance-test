import React from "react";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories Management - Admin Panel",
  description: "Create, organize, edit, and manage catalog categories and parent-child hierarchies.",
};

export default function AdminCategoriesPage(): React.JSX.Element {
  return <CategoriesManager />;
}
