"use client";

import React, { useEffect } from "react";

const WORD_ANIMATION_KEYFRAMES = `
@keyframes anim-bounce { 0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); } 40%, 43% { transform: translate3d(0, -12px, 0); } 70% { transform: translate3d(0, -6px, 0); } 90% { transform: translate3d(0, -2px, 0); } }
@keyframes anim-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }
@keyframes anim-shake { 0%, 100% { transform: translate3d(0, 0, 0); } 20%, 60% { transform: translate3d(-6px, 0, 0); } 40%, 80% { transform: translate3d(6px, 0, 0); } }
@keyframes anim-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes anim-slide { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes anim-wobble { 0% { transform: translate3d(0, 0, 0); } 15% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -5deg); } 30% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 3deg); } 45% { transform: translate3d(-10%, 0, 0) rotate3d(0, 0, 1, -3deg); } 60% { transform: translate3d(5%, 0, 0) rotate3d(0, 0, 1, 2deg); } 75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); } 100% { transform: translate3d(0, 0, 0); } }
@keyframes anim-jello { 0%, 11.1%, 100% { transform: translate3d(0, 0, 0); } 22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); } 66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); } 77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); } 88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); } }
@keyframes anim-heartBeat { 0% { transform: scale(1); } 14% { transform: scale(1.18); } 28% { transform: scale(1); } 42% { transform: scale(1.18); } 70% { transform: scale(1); } }
@keyframes anim-glow { 0%, 100% { text-shadow: 0 0 4px currentColor, 0 0 10px currentColor; } 50% { text-shadow: 0 0 16px currentColor, 0 0 24px currentColor; } }

.anim-bounce { display: inline-block; animation: anim-bounce 1s infinite; }
.anim-pulse { display: inline-block; animation: anim-pulse 1.2s infinite; }
.anim-shake { display: inline-block; animation: anim-shake 0.8s infinite; }
.anim-fade { display: inline-block; animation: anim-fade 0.8s ease-in forwards; }
.anim-slide { display: inline-block; animation: anim-slide 0.6s ease-out forwards; }
.anim-wobble { display: inline-block; animation: anim-wobble 1s infinite; }
.anim-jello { display: inline-block; animation: anim-jello 1s infinite; }
.anim-heartBeat { display: inline-block; animation: anim-heartBeat 1.3s infinite; }
.anim-glow { display: inline-block; animation: anim-glow 1.5s infinite; }
`;

/**
 * Ultra-lightweight IntersectionObserver for Scroll & Word Animations (<1ms CPU overhead)
 * Triggers entrance/scroll animations when elements scroll into viewport.
 */
export function ThemeAnimationObserver() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    // Inject word & letter animation keyframes if not present
    if (!document.getElementById("nasrify-word-anim-keyframes")) {
      const style = document.createElement("style");
      style.id = "nasrify-word-anim-keyframes";
      style.innerHTML = WORD_ANIMATION_KEYFRAMES;
      document.head.appendChild(style);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const anim = target.getAttribute("data-anim") || target.getAttribute("data-animation");
            if (anim && anim !== "none") {
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
              const anim = target.getAttribute("data-anim") || target.getAttribute("data-animation");
              if (anim && anim !== "none") {
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
      document.querySelectorAll("[data-animation], [data-anim]").forEach((el) => {
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

export default ThemeAnimationObserver;
