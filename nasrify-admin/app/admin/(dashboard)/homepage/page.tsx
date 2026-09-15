"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const HomepageManager = dynamic(
  () => import("@/components/admin/HomepageManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Homepage Builder..." /> }
);

export default function AdminHomepagePage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Homepage Builder - Admin Panel";
  }, []);

  return <HomepageManager />;
}
