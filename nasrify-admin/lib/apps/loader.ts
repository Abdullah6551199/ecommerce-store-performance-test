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
    WhatsAppStatsWidget: dynamic(() => import("@/apps/whatsapp-order/admin/WhatsAppStatsWidget")),
  },
  compare: {
    CompareSettings: dynamic(() => import("@/apps/compare/admin/CompareSettings")),
  },
  bundles: {
    BundlesManager: dynamic(() => import("@/apps/bundles/admin/BundlesManager")),
  },
  "order-tracking": {
    OrderTrackingSettings: dynamic(() => import("@/apps/order-tracking/admin/OrderTrackingSettings")),
  },
  broadcast: {
    BroadcastManager: dynamic(() => import("@/apps/broadcast/admin/BroadcastManager")),
  },
  "trust-badges": {
    TrustBadgesManager: dynamic(() => import("@/apps/trust-badges/admin/TrustBadgesManager")),
  },
  "cookie-consent": {
    CookieConsentManager: dynamic(() => import("@/apps/cookie-consent/admin/CookieConsentManager")),
  },
  "digital-products": {
    DigitalProductsManager: dynamic(() => import("@/apps/digital-products/admin/DigitalProductsManager")),
    DigitalProductUploader: dynamic(() => import("@/apps/digital-products/admin/DigitalProductUploader")),
    DigitalStatsWidget: dynamic(() => import("@/apps/digital-products/admin/DigitalStatsWidget")),
  },
  coupons: {
    CouponsManager: dynamic(() => import("@/apps/coupons/admin/CouponsManager")),
    CouponsDashboardWidget: dynamic(() => import("@/apps/coupons/admin/CouponsDashboardWidget")),
    DashboardWidget: dynamic(() => import("@/apps/coupons/admin/CouponsDashboardWidget")),
  },
  "product-qa": {
    ProductQAManager: dynamic(() => import("@/apps/product-qa/admin/ProductQAManager")),
    QADashboardWidget: dynamic(() => import("@/apps/product-qa/admin/QADashboardWidget")),
    DashboardWidget: dynamic(() => import("@/apps/product-qa/admin/QADashboardWidget")),
  },
  "ai-review-generator": {
    AIGeneratorPanel: dynamic(() => import("@/apps/ai-review-generator/admin/AIGeneratorPanel").then((m) => m.AIGeneratorPanel)),
    AIDashboardWidget: dynamic(() => import("@/apps/ai-review-generator/admin/AIDashboardWidget").then((m) => m.AIDashboardWidget)),
    DashboardWidget: dynamic(() => import("@/apps/ai-review-generator/admin/AIDashboardWidget").then((m) => m.AIDashboardWidget)),
  },
  chatbot: {
    ChatbotSettings: dynamic(() => import("@/apps/chatbot/admin/ChatbotSettings")),
    ChatbotDashboardWidget: dynamic(() => import("@/apps/chatbot/admin/ChatbotDashboardWidget")),
    DashboardWidget: dynamic(() => import("@/apps/chatbot/admin/ChatbotDashboardWidget")),
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
