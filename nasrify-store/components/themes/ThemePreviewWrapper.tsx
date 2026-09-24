"use client";

import React, { useState, useEffect } from "react";
import { ThemeConfig, StoreData } from "@/lib/themes/types";
import { renderTheme } from "@/lib/themes/engine";
import { generateThemeVarsCss } from "@/lib/themes/css";
import { getFontsInUse, getFontFaceCSS } from "@/lib/themes/fonts";

interface ThemePreviewWrapperProps {
  initialTheme: ThemeConfig;
  storeData: StoreData;
}

export default function ThemePreviewWrapper({
  initialTheme,
  storeData,
}: ThemePreviewWrapperProps) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);

  useEffect(() => {
    const isPreviewMode =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=1");

    if (isPreviewMode) {
      // Notify parent admin editor that iframe preview is ready
      try {
        window.parent?.postMessage({ type: "PREVIEW_READY" }, "*");
      } catch {}

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "UPDATE_THEME" && event.data?.theme) {
          const newTheme = event.data.theme as ThemeConfig;
          setTheme(newTheme);

          // Live update dynamic CSS variables in <head>
          const styleTag = document.getElementById("nasrify-theme-vars");
          if (styleTag) {
            styleTag.innerHTML = generateThemeVarsCss(newTheme);
          }

          // Live update @font-face declarations for newly selected fonts
          const fontStyleTag = document.getElementById("nasrify-fonts-css");
          if (fontStyleTag) {
            const inUse = getFontsInUse(newTheme);
            fontStyleTag.innerHTML = getFontFaceCSS(inUse);
          }
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, []);

  return <>{renderTheme(theme, storeData)}</>;
}
