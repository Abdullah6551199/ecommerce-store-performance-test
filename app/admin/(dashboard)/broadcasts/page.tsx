"use client";

import React, { useEffect } from "react";
import BroadcastManager from "@/components/admin/BroadcastManager";

export default function AdminBroadcastsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Broadcast Notifications - Admin Panel";
  }, []);

  return <BroadcastManager />;
}
