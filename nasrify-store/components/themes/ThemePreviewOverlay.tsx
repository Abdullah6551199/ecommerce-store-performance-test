"use client";

import React, { useEffect, useState, useRef } from "react";

interface HoverTarget {
  type: "component" | "section";
  sectionId: string;
  componentId?: string;
  componentType?: string;
  label: string;
  rect: DOMRect;
}

export function ThemePreviewOverlay() {
  const [target, setTarget] = useState<HoverTarget | null>(null);
  const [selected, setSelected] = useState<HoverTarget | null>(null);
  const cycleIndexRef = useRef<number>(-1);

  useEffect(() => {
    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=1");
    if (!isPreview) return;

    const handleMouseMove = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;

      // Don't trigger if hovering over the overlay controls themselves
      if (el.closest("#nasrify-elementor-overlay")) return;

      // 1. Check for closest component
      const compEl = el.closest<HTMLElement>("[data-component-id], [data-editable]");
      if (compEl) {
        let componentId = compEl.getAttribute("data-component-id") || compEl.getAttribute("data-editable") || "";
        let componentType = compEl.getAttribute("data-component-type") || "";
        if (!componentType) {
          if (componentId.includes("heading")) componentType = "heading";
          else if (componentId.includes("subheading")) componentType = "subheading";
          else if (componentId.includes("button") || componentId.includes("cta")) componentType = "button";
          else if (componentId.includes("image")) componentType = "image";
          else if (componentId.includes("text") || componentId.includes("paragraph")) componentType = "paragraph";
          else componentType = componentId;
        }

        const sectionContainer = compEl.closest<HTMLElement>("[data-section-id]");
        const sectionId = sectionContainer?.getAttribute("data-section-id") || "";

        const label =
          componentType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        setTarget({
          type: "component",
          sectionId,
          componentId,
          componentType,
          label,
          rect: compEl.getBoundingClientRect(),
        });
        return;
      }

      // 2. Check for closest section
      const secEl = el.closest<HTMLElement>("[data-section-id]");
      if (secEl) {
        const sectionId = secEl.getAttribute("data-section-id") || "";
        const sectionType = secEl.getAttribute("data-section-type") || sectionId;
        const label = `${sectionType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Section`;

        setTarget({
          type: "section",
          sectionId,
          label,
          rect: secEl.getBoundingClientRect(),
        });
        return;
      }

      setTarget(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTarget(null);
        setSelected(null);
        return;
      }

      if (e.key === "Tab") {
        const allTargets = Array.from(
          document.querySelectorAll<HTMLElement>("[data-component-id], [data-editable], [data-section-id]")
        );
        if (allTargets.length === 0) return;

        e.preventDefault();
        let nextIdx = e.shiftKey ? cycleIndexRef.current - 1 : cycleIndexRef.current + 1;
        if (nextIdx < 0) nextIdx = allTargets.length - 1;
        if (nextIdx >= allTargets.length) nextIdx = 0;
        cycleIndexRef.current = nextIdx;

        const curEl = allTargets[nextIdx];
        curEl.scrollIntoView({ behavior: "smooth", block: "center" });

        const isComp = curEl.hasAttribute("data-component-id") || curEl.hasAttribute("data-editable");
        if (isComp) {
          let componentId = curEl.getAttribute("data-component-id") || curEl.getAttribute("data-editable") || "";
          let componentType = curEl.getAttribute("data-component-type") || "";
          if (!componentType) {
            if (componentId.includes("heading")) componentType = "heading";
            else if (componentId.includes("subheading")) componentType = "subheading";
            else if (componentId.includes("button") || componentId.includes("cta")) componentType = "button";
            else if (componentId.includes("image")) componentType = "image";
            else if (componentId.includes("text") || componentId.includes("paragraph")) componentType = "paragraph";
            else componentType = componentId;
          }

          const sectionContainer = curEl.closest<HTMLElement>("[data-section-id]");
          const sectionId = sectionContainer?.getAttribute("data-section-id") || "";
          const label = componentType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

          setSelected({
            type: "component",
            sectionId,
            componentId,
            componentType,
            label,
            rect: curEl.getBoundingClientRect(),
          });
        } else {
          const sectionId = curEl.getAttribute("data-section-id") || "";
          const sectionType = curEl.getAttribute("data-section-type") || sectionId;
          const label = `${sectionType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Section`;

          setSelected({
            type: "section",
            sectionId,
            label,
            rect: curEl.getBoundingClientRect(),
          });
        }
      }
    };

    const handleScroll = () => {
      // Re-evaluate target rect on scroll if active
      setTarget((prev) => {
        if (!prev) return null;
        let el: HTMLElement | null = null;
        if (prev.type === "component" && prev.componentId) {
          el = document.querySelector(`[data-component-id="${prev.componentId}"], [data-editable="${prev.componentId}"]`);
        } else if (prev.sectionId) {
          el = document.querySelector(`[data-section-id="${prev.sectionId}"]`);
        }
        if (el) {
          return { ...prev, rect: el.getBoundingClientRect() };
        }
        return prev;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const active = selected || target;
  if (!active || !active.rect) return null;

  const isComponent = active.type === "component";
  const borderColor = isComponent ? "#25D366" : "#3B82F6";
  const badgeBg = isComponent ? "bg-[#25D366] text-black" : "bg-[#3B82F6] text-white";

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isComponent && active.componentId) {
      window.parent?.postMessage(
        {
          type: "EDIT_COMPONENT",
          sectionId: active.sectionId,
          componentId: active.componentId,
          componentType: active.componentType || "text",
        },
        "*"
      );
    } else {
      window.parent?.postMessage(
        {
          type: "EDIT_SECTION",
          sectionId: active.sectionId,
        },
        "*"
      );
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isComponent && active.componentId) {
      window.parent?.postMessage(
        {
          type: "DELETE_COMPONENT",
          sectionId: active.sectionId,
          componentId: active.componentId,
        },
        "*"
      );
    }
  };

  return (
    <div
      id="nasrify-elementor-overlay"
      className="fixed pointer-events-none z-[10000] transition-all duration-75"
      style={{
        top: `${active.rect.top}px`,
        left: `${active.rect.left}px`,
        width: `${active.rect.width}px`,
        height: `${active.rect.height}px`,
        border: `2px solid ${borderColor}`,
        boxShadow: `0 0 10px ${borderColor}40`,
        padding: 0,
      }}
    >
      {/* Top Left Badge (Inside top-left corner) */}
      <div
        className={`absolute top-[6px] left-[6px] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md ${badgeBg} pointer-events-none z-[10000]`}
      >
        <span>{isComponent ? "🧩" : "📑"}</span>
        <span>{active.label}</span>
      </div>

      {/* Top Right Action Buttons (Inside box boundary, 28x28px each) */}
      <div className="absolute top-[6px] right-[6px] flex items-center gap-1.5 pointer-events-auto z-[10000]">
        {/* Delete Component Button (Only on components, sections delete via sidebar) */}
        {isComponent && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center shadow-md transition-colors cursor-pointer shrink-0"
            title={`Delete ${active.label}`}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Edit Button (28x28px, green/blue bg, white pencil icon) */}
        <button
          type="button"
          onClick={handleEdit}
          className={`w-7 h-7 ${isComponent ? "bg-[#25D366] hover:bg-[#1fa851]" : "bg-[#3B82F6] hover:bg-[#2563eb]"} text-white rounded flex items-center justify-center shadow-md transition-colors cursor-pointer shrink-0`}
          title={`Edit ${active.label}`}
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ThemePreviewOverlay;
