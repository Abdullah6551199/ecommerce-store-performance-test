"use client";

import React, { useEffect } from "react";
import HomepageManager from "@/components/admin/HomepageManager";

export default function AdminHomepagePage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Homepage Builder - Admin Panel";
  }, []);

  return <HomepageManager />;
}
