"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const AppsManager = dynamic(() => import("@/components/admin/AppsManager"), {
  ssr: false,
  loading: () => <AdminLoadingSkeleton title="Loading Apps & Extensions..." />,
});

export default function AdminAppsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Apps & Plugins - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Apps & Extensions">
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Apps &amp; Extensions
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-white/60">
            Extend store functionality with modular apps, widgets, and third-party integrations.
          </p>
        </div>

        <AppsManager />
      </div>
    </AdminErrorBoundary>
  );
}
