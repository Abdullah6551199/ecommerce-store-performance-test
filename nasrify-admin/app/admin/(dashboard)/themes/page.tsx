import React from "react";
import ThemesManager from "@/components/admin/ThemesManager";

export const metadata = {
  title: "Themes | Nasrify Admin",
  description: "Manage storefront themes and active design templates",
};

export default function ThemesPage() {
  return <ThemesManager />;
}
