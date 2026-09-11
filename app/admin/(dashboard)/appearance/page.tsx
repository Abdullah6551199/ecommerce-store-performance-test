"use client";

import React, { useEffect } from "react";
import AppearanceManager from "@/components/admin/AppearanceManager";

export default function AdminAppearancePage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Appearance & Theme - Admin Panel";
  }, []);

  return <AppearanceManager />;
}
