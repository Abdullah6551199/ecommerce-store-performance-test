import React from "react";
import CustomersManager from "@/components/admin/CustomersManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customers Directory | Admin Dashboard",
  description: "View and manage registered customers, order history, and lifetime customer value.",
};

export default function AdminCustomersPage(): React.JSX.Element {
  return <CustomersManager />;
}
