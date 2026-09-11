"use client";

import React, { useEffect } from "react";
import MediaManager from "@/components/admin/MediaManager";

export default function AdminMediaPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Media Library - Admin Panel";
  }, []);

  return <MediaManager />;
}
