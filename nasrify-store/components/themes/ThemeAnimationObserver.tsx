"use client";

import { useEffect } from "react";

/**
 * Ultra-lightweight IntersectionObserver for Scroll & Word Animations (<1ms CPU overhead)
 * Triggers entrance/scroll animations when elements scroll into viewport.
 */
export function ThemeAnimationObserver() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const anim = target.getAttribute("data-animation");
            if (anim) {
              target.classList.add(`anim-${anim}`);
            }
            target.classList.add("anim-triggered");
            // If repeat not specified, unobserve once triggered
            if (!target.hasAttribute("data-animation-repeat")) {
              observer.unobserve(target);
            }
          } else {
            const target = entry.target as HTMLElement;
            if (target.hasAttribute("data-animation-repeat")) {
              const anim = target.getAttribute("data-animation");
              if (anim) {
                target.classList.remove(`anim-${anim}`);
              }
              target.classList.remove("anim-triggered");
            }
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const observeElements = () => {
      document.querySelectorAll("[data-animation]").forEach((el) => {
        observer.observe(el);
      });
    };

    observeElements();

    // Re-observe if new nodes mounted (e.g. navigation or preview update)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
