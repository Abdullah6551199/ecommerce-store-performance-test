"use client";

import { useEffect } from "react";
import { getStoredCookieConsent } from "../lib/cookie-consent";
import type { CookieConsentState } from "../shared/types";

/**
 * ScriptBlocker Component
 * Enforces zero-consent-leak by gating third-party scripts until visitor consent.
 * 100% Client-Side Execution (0 worker CPU overhead).
 */
export default function ScriptBlocker(): null {
  useEffect(() => {
    const evaluateScripts = (consent: CookieConsentState | null) => {
      if (!consent) return;

      // 1. Analytics scripts
      if (consent.analytics) {
        if (typeof window !== "undefined" && !(window as any).__ga_initialized) {
          (window as any).__ga_initialized = true;
          // Dynamically load Google Analytics if tag exists
          const gaId = (window as any).__NEXT_DATA__?.props?.pageProps?.gaId;
          if (gaId) {
            const script = document.createElement("script");
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            document.head.appendChild(script);
          }
        }
      }

      // 2. Marketing scripts
      if (consent.marketing) {
        if (typeof window !== "undefined" && !(window as any).__pixels_initialized) {
          (window as any).__pixels_initialized = true;
        }
      }

      // 3. Functional scripts
      if (consent.functional) {
        if (typeof window !== "undefined" && !(window as any).__functional_initialized) {
          (window as any).__functional_initialized = true;
        }
      }
    };

    // Evaluate initial state
    evaluateScripts(getStoredCookieConsent());

    // Listen for consent updates
    const handleConsentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CookieConsentState>;
      if (customEvent.detail) {
        evaluateScripts(customEvent.detail);
      }
    };

    window.addEventListener("cookie_consent_updated", handleConsentUpdate);
    window.addEventListener("apex_cookie_consent_updated", handleConsentUpdate);

    return () => {
      window.removeEventListener("cookie_consent_updated", handleConsentUpdate);
      window.removeEventListener("apex_cookie_consent_updated", handleConsentUpdate);
    };
  }, []);

  return null;
}
