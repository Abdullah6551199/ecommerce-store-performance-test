"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppErrorBoundary } from "./AppErrorBoundary";

const WhatsAppFloatingButton = dynamic(
  () => import("@/apps/whatsapp-order/storefront/WhatsAppFloatingButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

interface Props {
  enabledAppIds: string[];
}

export default function StorefrontFloatingClient({
  enabledAppIds,
}: Props): React.JSX.Element | null {
  if (!enabledAppIds || enabledAppIds.length === 0) {
    return null;
  }

  const hasWhatsApp = enabledAppIds.includes("whatsapp-order");

  if (!hasWhatsApp) {
    return null;
  }

  return (
    <div
      id="storefront-floating-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto"
      aria-label="Floating actions"
    >
      {hasWhatsApp && (
        <AppErrorBoundary appId="whatsapp-order" extensionPoint="storefront.floating">
          <WhatsAppFloatingButton />
        </AppErrorBoundary>
      )}
    </div>
  );
}
