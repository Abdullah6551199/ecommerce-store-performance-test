import React from "react";
import OrdersManager from "@/components/admin/OrdersManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Orders & Fulfillment - Admin Panel",
  description: "Track customer checkouts, COD cash receipts, and manage shipment fulfillment statuses.",
};

export default function AdminOrdersPage(): React.JSX.Element {
  return <OrdersManager />;
}
