"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const ShippingZonesManager = dynamic(
  () => import("@/components/admin/ShippingZonesManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Shipping Zones..." /> }
);

export default function AdminShippingZonesPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Shipping Zones & Rates - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Shipping Zones">
      <ShippingZonesManager />
    </AdminErrorBoundary>
  );
}
