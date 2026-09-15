"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const TrustBadgesManager = dynamic(
  () => import("@/components/admin/TrustBadgesManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Trust Badges & Icons..." /> }
);

export default function TrustBadgesAdminPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Trust Badges & Payment Icons - Admin Panel";
  }, []);

  return <TrustBadgesManager />;
}
