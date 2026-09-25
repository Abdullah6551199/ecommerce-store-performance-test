"use client";

import React, { useState, useEffect } from "react";
import { ThemeConfig, StoreData } from "@/lib/themes/types";
import { renderTheme } from "@/lib/themes/engine";
import { generateThemeVarsCss } from "@/lib/themes/css";
import { getFontsInUse, getFontFaceCSS } from "@/lib/themes/fonts";
import { generateAdvancedCSS } from "@/lib/themes/section-css-generator";
import { ThemeAnimationObserver } from "@/components/themes/ThemeAnimationObserver";

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
    setTheme(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    const isPreviewTheme =
      typeof window !== "undefined" &&
      window.location.search.includes("preview_theme=");

    if (isPreviewTheme && initialTheme) {
      const styleTag = document.getElementById("nasrify-theme-vars");
      if (styleTag) {
        styleTag.innerHTML = generateThemeVarsCss(initialTheme);
      }
      const fontStyleTag = document.getElementById("nasrify-fonts-css");
      if (fontStyleTag) {
        const inUse = getFontsInUse(initialTheme);
        fontStyleTag.innerHTML = getFontFaceCSS(inUse);
      }
    }

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

          // Live update advanced scoped CSS (multi-gradient, shadows, animations, hover)
          const advStyleTag = document.getElementById("theme-advanced-css");
          const advancedCSS = generateAdvancedCSS(newTheme);
          if (advStyleTag) {
            advStyleTag.innerHTML = advancedCSS;
          } else if (advancedCSS) {
            const newStyle = document.createElement("style");
            newStyle.id = "theme-advanced-css";
            newStyle.innerHTML = advancedCSS;
            document.head.appendChild(newStyle);
          }
        }
      };

      window.addEventListener("message", handleMessage);

      // --- INLINE EDITING (Shopify-like) ---
      let activeEditingEl: HTMLElement | null = null;
      let originalText = "";

      const handleDblClick = (e: MouseEvent) => {
        // Disable on touch devices
        if ("ontouchstart" in window && window.innerWidth <= 768) return;

        const target = e.target as HTMLElement | null;
        if (!target) return;

        // Find editable target
        const editableEl = target.closest<HTMLElement>("[data-editable]") ||
          (target.matches("h1, h2, h3, h4, p, span, button, a") && target.closest<HTMLElement>("[data-section-id]") ? target : null);

        if (!editableEl) return;

        const sectionContainer = editableEl.closest<HTMLElement>("[data-section-id]");
        if (!sectionContainer) return;

        const sectionId = sectionContainer.getAttribute("data-section-id");
        if (!sectionId) return;

        let field = editableEl.getAttribute("data-editable");
        if (!field) {
          // Infer field from tag
          const tag = editableEl.tagName.toLowerCase();
          if (tag.startsWith("h")) field = "heading";
          else if (tag === "p") field = "subheading";
          else if (tag === "button" || tag === "a") field = "cta_text";
          else field = "text";
        }

        e.preventDefault();
        e.stopPropagation();

        activeEditingEl = editableEl;
        originalText = editableEl.innerText;

        editableEl.contentEditable = "true";
        editableEl.style.outline = "2px solid #25D366";
        editableEl.style.outlineOffset = "4px";
        editableEl.style.borderRadius = "4px";
        editableEl.style.boxShadow = "0 0 12px rgba(37, 211, 102, 0.4)";
        editableEl.focus();

        // Select all text in element
        const range = document.createRange();
        range.selectNodeContents(editableEl);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        // Key handler for Enter / Esc
        const onKeyDown = (keyEvent: KeyboardEvent) => {
          if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
            keyEvent.preventDefault();
            const newVal = editableEl.innerText.trim();
            cleanup();
            if (newVal !== originalText) {
              window.parent?.postMessage(
                {
                  type: "INLINE_EDIT",
                  sectionId,
                  field,
                  value: newVal,
                },
                "*"
              );
            }
          } else if (keyEvent.key === "Escape") {
            keyEvent.preventDefault();
            editableEl.innerText = originalText;
            cleanup();
          }
        };

        const onBlur = () => {
          const newVal = editableEl.innerText.trim();
          cleanup();
          if (newVal !== originalText) {
            window.parent?.postMessage(
              {
                type: "INLINE_EDIT",
                sectionId,
                field,
                value: newVal,
              },
              "*"
            );
          }
        };

        const cleanup = () => {
          editableEl.contentEditable = "false";
          editableEl.style.outline = "";
          editableEl.style.outlineOffset = "";
          editableEl.style.borderRadius = "";
          editableEl.style.boxShadow = "";
          editableEl.removeEventListener("keydown", onKeyDown);
          editableEl.removeEventListener("blur", onBlur);
          activeEditingEl = null;
        };

        editableEl.addEventListener("keydown", onKeyDown);
        editableEl.addEventListener("blur", onBlur);
      };

      // Click to select section in editor sidebar
      const handleClick = (e: MouseEvent) => {
        if (activeEditingEl) return;
        const target = e.target as HTMLElement | null;
        if (!target) return;

        const sectionContainer = target.closest<HTMLElement>("[data-section-id]");
        if (sectionContainer) {
          const sectionId = sectionContainer.getAttribute("data-section-id");
          if (sectionId) {
            window.parent?.postMessage(
              {
                type: "SELECT_SECTION",
                sectionId,
              },
              "*"
            );
          }
        }
      };

      document.addEventListener("dblclick", handleDblClick);
      document.addEventListener("click", handleClick);

      return () => {
        window.removeEventListener("message", handleMessage);
        document.removeEventListener("dblclick", handleDblClick);
        document.removeEventListener("click", handleClick);
      };
    }
  }, []);

  return (
    <>
      <ThemeAnimationObserver />
      {renderTheme(theme, storeData)}
    </>
  );
}
