"use client";

import React from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const ShippingZonesManager = dynamic(
  () => import("@/components/admin/ShippingZonesManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Shipping Zones..." /> }
);

export default function AdminShippingZonesPage(): React.JSX.Element {
  return <ShippingZonesManager />;
}
