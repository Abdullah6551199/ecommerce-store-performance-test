"use client";

import React, { useEffect } from "react";
import OrdersManager from "@/components/admin/OrdersManager";

export default function AdminOrdersPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Orders & Fulfillment - Admin Panel";
  }, []);

  return <OrdersManager />;
}
