import React from "react";
import MediaManager from "@/components/admin/MediaManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Media Library | Admin Dashboard",
  description: "Manage Cloudflare R2 media assets, upload photos, and copy asset URLs.",
};

export default function AdminMediaPage(): React.JSX.Element {
  return <MediaManager />;
}
