"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const CookieConsentManager = dynamic(
  () => import("@/components/admin/CookieConsentManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Cookie Consent Settings..." /> }
);

export default function CookieConsentAdminPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Cookie Consent & GDPR - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="Cookie Consent & GDPR">
      <CookieConsentManager />
    </AdminErrorBoundary>
  );
}
