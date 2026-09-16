import React from "react";
import AppSettingsClient from "@/components/admin/AppSettingsClient";

interface Props {
  params: Promise<{ appId: string }>;
}

export default async function AdminAppDetailPage({ params }: Props) {
  const { appId } = await params;
  return <AppSettingsClient appId={appId} />;
}
