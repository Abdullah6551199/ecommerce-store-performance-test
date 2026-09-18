import React from "react";
import dynamic from "next/dynamic";

/**
 * Component Loader Registry for Admin Worker
 * Pre-registered dynamic imports for admin extension components.
 */
export const APP_ADMIN_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {
  "hello-world": {
    HelloWorldWidget: dynamic(() => import("@/apps/hello-world/admin/HelloWorldWidget")),
  },
  reviews: {
    ReviewsManager: dynamic(() => import("@/apps/reviews/admin/ReviewsManager")),
  },
  "whatsapp-order": {
    WhatsAppSettings: dynamic(() => import("@/apps/whatsapp-order/admin/WhatsAppSettings")),
  },
};

export function loadAdminAppComponent(
  appId?: string,
  componentName?: string
): React.ComponentType<any> | null {
  if (!appId || !componentName) return null;
  return APP_ADMIN_COMPONENTS[appId]?.[componentName] || null;
}

export function loadStorefrontAppComponent(
  appId?: string,
  componentName?: string
): React.ComponentType<any> | null {
  // Storefront components are not included in the admin worker
  return null;
}

// Backwards-compatibility aliases
export const loadAppAdminComponent = loadAdminAppComponent;
export const loadAppStorefrontComponent = loadStorefrontAppComponent;
