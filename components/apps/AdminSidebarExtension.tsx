import React from "react";
import { getInstalledApps } from "@/lib/apps/installed";
import { getAllManifests } from "@/lib/apps/registry";
import { loadAppAdminComponent } from "@/lib/apps/loader";
import { AppErrorBoundary } from "./AppErrorBoundary";

export default async function AdminSidebarExtension(): Promise<React.JSX.Element | null> {
  const manifests = getAllManifests();
  const installed = await getInstalledApps();
  const enabledAppIds = new Set(installed.filter((i) => i.enabled).map((i) => i.id));

  const matching = manifests.filter(
    (m) => enabledAppIds.has(m.id) && m.extensionPoints.includes("admin.sidebar")
  );

  if (matching.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {matching.map((app) => {
        const Component = loadAppAdminComponent(app.id, "SidebarExtension");
        if (!Component) return null;
        return (
          <AppErrorBoundary key={app.id} appId={app.id} extensionPoint="admin.sidebar">
            <Component />
          </AppErrorBoundary>
        );
      })}
    </div>
  );
}
