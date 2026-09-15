import React from "react";
import { getInstalledApps } from "@/lib/apps/installed";
import { getAllManifests } from "@/lib/apps/registry";
import { loadAppAdminComponent } from "@/lib/apps/loader";
import { AppErrorBoundary } from "./AppErrorBoundary";

interface AdminRouteExtensionProps {
  appId: string;
}

export default async function AdminRouteExtension({
  appId,
}: AdminRouteExtensionProps): Promise<React.JSX.Element | null> {
  const manifests = getAllManifests();
  const installed = await getInstalledApps();
  const isEnabled = installed.some((i) => i.id === appId && i.enabled);

  const manifest = manifests.find((m) => m.id === appId);
  if (!manifest || !isEnabled || !manifest.extensionPoints.includes("admin.route")) {
    return null;
  }

  const Component = loadAppAdminComponent(appId, "AdminPage");
  if (!Component) return null;

  return (
    <AppErrorBoundary appId={appId} extensionPoint="admin.route">
      <Component />
    </AppErrorBoundary>
  );
}
