import React from "react";
import CookieConsentManager from "@/components/admin/CookieConsentManager";

export const metadata = {
  title: "Cookie Consent & GDPR - Admin",
  description: "Configure customer cookie consent banner, categories, and policy",
};

export default function CookieConsentAdminPage(): React.JSX.Element {
  return <CookieConsentManager />;
}
