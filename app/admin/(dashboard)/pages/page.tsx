"use client";

import React, { useEffect } from "react";
import PagesManager from "@/components/admin/pages/PagesManager";

export default function AdminPagesCMS(): React.JSX.Element {
  useEffect(() => {
    document.title = "Pages & Content CMS - Admin Panel";
  }, []);

  return <PagesManager />;
}
