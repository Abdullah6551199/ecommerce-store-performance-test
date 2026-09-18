import React from "react";
import dynamic from "next/dynamic";

/**
 * Component Loader Registry for Apps
 * Pre-registered dynamic imports allow Next.js bundler to split app components
 * cleanly without relying on non-statically analyzable template strings.
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

export const APP_STOREFRONT_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {
  "hello-world": {
    HelloWorldBanner: dynamic(() => import("@/apps/hello-world/storefront/HelloWorldBanner")),
  },
  reviews: {
    ReviewsList: dynamic(() => import("@/apps/reviews/storefront/ReviewsList")),
  },
  "whatsapp-order": {
    WhatsAppFloatingButton: dynamic(() => import("@/apps/whatsapp-order/storefront/WhatsAppFloatingButton")),
    WhatsAppProductButton: dynamic(() => import("@/apps/whatsapp-order/storefront/WhatsAppProductButton")),
  },
};

export function loadAppAdminComponent(
  appId: string,
  componentName: string
): React.ComponentType<any> | null {
  return APP_ADMIN_COMPONENTS[appId]?.[componentName] || null;
}

export function loadAppStorefrontComponent(
  appId: string,
  componentName: string
): React.ComponentType<any> | null {
  return APP_STOREFRONT_COMPONENTS[appId]?.[componentName] || null;
}
