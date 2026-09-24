import React from "react";
import ThemeDetailView from "@/components/admin/ThemeDetailView";

export const metadata = {
  title: "Theme Details | Nasrify Admin",
};

export default async function ThemeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ThemeDetailView themeId={id} />;
}
