"use client";

import React, { use, useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const AppSettingsClient = dynamic(
  () => import("@/components/admin/AppSettingsClient"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading App Settings..." /> }
);

interface Props {
  params: Promise<{ appId: string }>;
}

export default function AdminAppDetailPage({ params }: Props): React.JSX.Element {
  const { appId } = use(params);

  useEffect(() => {
    document.title = `App Settings (${appId}) - Admin Panel`;
  }, [appId]);

  return (
    <AdminErrorBoundary moduleName="App Settings">
      <AppSettingsClient appId={appId} />
    </AdminErrorBoundary>
  );
}
