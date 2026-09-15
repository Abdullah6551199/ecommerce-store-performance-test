import React from "react";
import TrustBadgesManager from "@/components/admin/TrustBadgesManager";

export const metadata = {
  title: "Trust Badges & Payment Icons - Admin",
  description: "Manage security trust badges, return policies, and payment icons across storefront pages",
};

export default function TrustBadgesAdminPage(): React.JSX.Element {
  return <TrustBadgesManager />;
}
