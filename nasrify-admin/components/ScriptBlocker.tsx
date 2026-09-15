"use client";

import React, { useEffect } from "react";
import {
  shouldLoadScript,
  COOKIE_CONSENT_EVENT,
  type CookieConsentState,
} from "@/lib/script-blocker";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    ttq?: any;
    hj?: (...args: any[]) => void;
    _hjSettings?: { hjid: number; hjsv: number };
  }
}

/**
 * Stage 22 GDPR Script Blocker
 * Evaluates cookie consent choices and conditionally executes third-party scripts.
 * Strictly prevents analytics and marketing telemetry from executing until explicit user consent.
 */
export default function ScriptBlocker(): React.JSX.Element | null {
  const initScripts = () => {
    if (typeof window === "undefined") return;

    // 1. Analytics Category: Google Analytics & Hotjar
    if (shouldLoadScript("analytics")) {
      // Google Analytics stub / bootstrap
      if (!window.dataLayer) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer?.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", "G-ECOMMPERF01", { anonymize_ip: true });
        console.info("[GDPR ScriptBlocker] Analytics scripts permitted & initialized (Google Analytics).");
      }

      // Hotjar stub
      if (!window.hj) {
        window.hj = function () {
          ((window.hj as any).q = (window.hj as any).q || []).push(arguments);
        };
        window._hjSettings = { hjid: 999999, hjsv: 6 };
        console.info("[GDPR ScriptBlocker] Analytics scripts permitted & initialized (Hotjar).");
      }
    } else {
      // If consent was revoked
      if (window.gtag) {
        window.gtag("consent", "default", {
          analytics_storage: "denied",
          ad_storage: "denied",
        });
      }
    }

    // 2. Marketing Category: Meta Pixel & TikTok Pixel
    if (shouldLoadScript("marketing")) {
      // Meta Pixel stub
      if (!window.fbq) {
        const fbq: any = function () {
          if (fbq.callMethod) {
            fbq.callMethod.apply(fbq, arguments);
          } else {
            fbq.queue.push(arguments);
          }
        };
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = "2.0";
        fbq.queue = [];
        window.fbq = fbq;
        window._fbq = fbq;
        fbq("init", "123456789012345");
        fbq("track", "PageView");
        console.info("[GDPR ScriptBlocker] Marketing scripts permitted & initialized (Meta Pixel).");
      }

      // TikTok Pixel stub
      if (!window.ttq) {
        window.ttq = {
          load: function () {},
          page: function () {},
          track: function () {},
        };
        console.info("[GDPR ScriptBlocker] Marketing scripts permitted & initialized (TikTok Pixel).");
      }
    }

    // 3. Functional Category
    if (shouldLoadScript("functional")) {
      console.info("[GDPR ScriptBlocker] Functional scripts & client persistence enabled.");
    }
  };

  useEffect(() => {
    // Initial evaluation on mount
    initScripts();

    // Re-evaluate whenever user updates consent preferences
    const handleConsentUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<CookieConsentState>;
      console.info("[GDPR ScriptBlocker] Consent choices updated:", customEvent.detail);
      initScripts();
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated);
    };
  }, []);

  return null;
}
