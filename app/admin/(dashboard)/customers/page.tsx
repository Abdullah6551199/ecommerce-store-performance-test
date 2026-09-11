"use client";

import React, { useEffect } from "react";
import CustomersManager from "@/components/admin/CustomersManager";

export default function AdminCustomersPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Customers Directory - Admin Panel";
  }, []);

  return <CustomersManager />;
}
