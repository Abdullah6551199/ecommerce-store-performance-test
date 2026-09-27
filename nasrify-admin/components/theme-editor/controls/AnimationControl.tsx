"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export type AnimationPreset =
  | "none"
  | "fadeIn"
  | "fadeOut"
  | "slideInUp"
  | "slideInDown"
  | "slideInLeft"
  | "slideInRight"
  | "zoomIn"
  | "zoomOut"
  | "bounce"
  | "bounceIn"
  | "pulse"
  | "shake"
  | "swing"
  | "tada"
  | "wobble"
  | "jello"
  | "heartBeat"
  | "flipInX"
  | "flipInY"
  | "rotateIn"
  | "rotateInUpLeft"
  | "rotateInUpRight"
  | "rotateInDownLeft"
  | "rotateInDownRight"
  | "flash"
  | "rubberBand"
  | "backInUp"
  | "lightSpeedInRight";

export interface AnimationConfig {
  entrance: {
    preset: AnimationPreset;
    duration: number; // ms
    delay: number; // ms
    easing: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
  };
  scrollTrigger: {
    enabled: boolean;
    preset: AnimationPreset;
    offsetPercent: number; // 0 - 100
    repeat: boolean;
  };
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  entrance: {
    preset: "none",
    duration: 600,
    delay: 0,
    easing: "ease-out",
  },
  scrollTrigger: {
    enabled: false,
    preset: "fadeIn",
    offsetPercent: 15,
    repeat: false,
  },
};

export interface AnimationGroupItem {
  id: AnimationPreset;
  label: string;
  group: "Basic" | "Slide" | "Zoom" | "Rotate" | "Attention" | "3D" | "Speed";
}

export const ALL_ANIMATION_PRESETS: AnimationGroupItem[] = [
  // 1. Basic
  { id: "none", label: "None", group: "Basic" },
  { id: "fadeIn", label: "Fade In", group: "Basic" },
  { id: "fadeOut", label: "Fade Out", group: "Basic" },

  // 2. Slide
  { id: "slideInUp", label: "Slide In Up", group: "Slide" },
  { id: "slideInDown", label: "Slide In Down", group: "Slide" },
  { id: "slideInLeft", label: "Slide In Left", group: "Slide" },
  { id: "slideInRight", label: "Slide In Right", group: "Slide" },

  // 3. Zoom
  { id: "zoomIn", label: "Zoom In", group: "Zoom" },
  { id: "zoomOut", label: "Zoom Out", group: "Zoom" },

  // 4. Rotate
  { id: "rotateIn", label: "Rotate In", group: "Rotate" },
  { id: "rotateInUpLeft", label: "Rotate In Up Left", group: "Rotate" },
  { id: "rotateInUpRight", label: "Rotate In Up Right", group: "Rotate" },
  { id: "rotateInDownLeft", label: "Rotate In Down Left", group: "Rotate" },
  { id: "rotateInDownRight", label: "Rotate In Down Right", group: "Rotate" },

  // 5. Attention
  { id: "bounce", label: "Bounce", group: "Attention" },
  { id: "bounceIn", label: "Bounce In", group: "Attention" },
  { id: "pulse", label: "Pulse", group: "Attention" },
  { id: "shake", label: "Shake", group: "Attention" },
  { id: "swing", label: "Swing", group: "Attention" },
  { id: "tada", label: "Tada", group: "Attention" },
  { id: "wobble", label: "Wobble", group: "Attention" },
  { id: "jello", label: "Jello", group: "Attention" },
  { id: "heartBeat", label: "Heart Beat", group: "Attention" },

  // 6. 3D
  { id: "flipInX", label: "Flip In X (Horizontal)", group: "3D" },
  { id: "flipInY", label: "Flip In Y (Vertical)", group: "3D" },

  // 7. Speed
  { id: "flash", label: "Flash", group: "Speed" },
  { id: "rubberBand", label: "Rubber Band", group: "Speed" },
  { id: "backInUp", label: "Back In Up", group: "Speed" },
  { id: "lightSpeedInRight", label: "Light Speed In", group: "Speed" },
];

export const KEYFRAME_CSS = `
@keyframes anim-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes anim-fadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes anim-slideInUp { from { transform: translate3d(0, 40px, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-slideInDown { from { transform: translate3d(0, -40px, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-slideInLeft { from { transform: translate3d(-40px, 0, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-slideInRight { from { transform: translate3d(40px, 0, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-zoomIn { from { opacity: 0; transform: scale3d(0.7, 0.7, 0.7); } 50% { opacity: 1; } to { transform: scale3d(1, 1, 1); } }
@keyframes anim-zoomOut { from { opacity: 1; } 50% { opacity: 0.8; transform: scale3d(0.8, 0.8, 0.8); } to { opacity: 1; transform: scale3d(1, 1, 1); } }
@keyframes anim-bounce { 0%, 20%, 53%, 80%, 100% { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); transform: translate3d(0, 0, 0); } 40%, 43% { animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06); transform: translate3d(0, -20px, 0); } 70% { animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06); transform: translate3d(0, -10px, 0); } 90% { transform: translate3d(0, -4px, 0); } }
@keyframes anim-bounceIn { 0%, 20%, 40%, 60%, 80%, 100% { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 20% { transform: scale3d(1.1, 1.1, 1.1); } 40% { transform: scale3d(0.9, 0.9, 0.9); } 60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); } 80% { transform: scale3d(0.97, 0.97, 0.97); } 100% { opacity: 1; transform: scale3d(1, 1, 1); } }
@keyframes anim-flipInX { from { transform: perspective(400px) rotate3d(1, 0, 0, 90deg); opacity: 0; } 40% { transform: perspective(400px) rotate3d(1, 0, 0, -20deg); } 60% { transform: perspective(400px) rotate3d(1, 0, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(1, 0, 0, -5deg); } to { transform: perspective(400px); } }
@keyframes anim-flipInY { from { transform: perspective(400px) rotate3d(0, 1, 0, 90deg); opacity: 0; } 40% { transform: perspective(400px) rotate3d(0, 1, 0, -20deg); } 60% { transform: perspective(400px) rotate3d(0, 1, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(0, 1, 0, -5deg); } to { transform: perspective(400px); } }
@keyframes anim-rotateIn { from { transform: rotate3d(0, 0, 1, -200deg); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-rotateInUpLeft { from { transform: rotate3d(0, 0, 1, 45deg); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-rotateInUpRight { from { transform: rotate3d(0, 0, 1, -45deg); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-rotateInDownLeft { from { transform: rotate3d(0, 0, 1, -45deg); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-rotateInDownRight { from { transform: rotate3d(0, 0, 1, 45deg); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-pulse { 0% { transform: scale3d(1, 1, 1); } 50% { transform: scale3d(1.08, 1.08, 1.08); } 100% { transform: scale3d(1, 1, 1); } }
@keyframes anim-shake { 0%, 100% { transform: translate3d(0, 0, 0); } 10%, 30%, 50%, 70%, 90% { transform: translate3d(-8px, 0, 0); } 20%, 40%, 60%, 80% { transform: translate3d(8px, 0, 0); } }
@keyframes anim-swing { 20% { transform: rotate3d(0, 0, 1, 15deg); } 40% { transform: rotate3d(0, 0, 1, -10deg); } 60% { transform: rotate3d(0, 0, 1, 5deg); } 80% { transform: rotate3d(0, 0, 1, -5deg); } 100% { transform: rotate3d(0, 0, 1, 0deg); } }
@keyframes anim-tada { 0% { transform: scale3d(1, 1, 1); } 10%, 20% { transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg); } 30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); } 40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); } 100% { transform: scale3d(1, 1, 1); } }
@keyframes anim-wobble { 0% { transform: translate3d(0, 0, 0); } 15% { transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg); } 30% { transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg); } 45% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg); } 60% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg); } 75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); } 100% { transform: translate3d(0, 0, 0); } }
@keyframes anim-jello { 0%, 11.1%, 100% { transform: translate3d(0, 0, 0); } 22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); } 66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); } 77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); } 88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); } }
@keyframes anim-heartBeat { 0% { transform: scale(1); } 14% { transform: scale(1.15); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }
@keyframes anim-flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0; } }
@keyframes anim-rubberBand { 0% { transform: scale3d(1, 1, 1); } 30% { transform: scale3d(1.25, 0.75, 1); } 40% { transform: scale3d(0.75, 1.25, 1); } 50% { transform: scale3d(1.15, 0.85, 1); } 65% { transform: scale3d(0.95, 1.05, 1); } 75% { transform: scale3d(1.05, 0.95, 1); } 100% { transform: scale3d(1, 1, 1); } }
@keyframes anim-backInUp { 0% { transform: translateY(1200px) scale(0.7); opacity: 0.7; } 80% { transform: translateY(0px) scale(0.7); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
@keyframes anim-lightSpeedInRight { from { transform: translate3d(100%, 0, 0) skewX(-30deg); opacity: 0; } 60% { transform: skewX(20deg); opacity: 1; } 80% { transform: skewX(-5deg); } to { transform: translate3d(0, 0, 0); } }
`;

interface AnimationControlProps {
  label?: string;
  value?: AnimationConfig | any;
  onChange: (config: AnimationConfig) => void;
  description?: string;
}

export function AnimationControl({
  label = "Animation & Entrance",
  value,
  onChange,
  description,
}: AnimationControlProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"entrance" | "scroll">("entrance");

  // Portal Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTarget, setDropdownTarget] = useState<"entrance" | "scroll">("entrance");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredAnim, setHoveredAnim] = useState<string | null>(null);

  const triggerEntranceRef = useRef<HTMLButtonElement | null>(null);
  const triggerScrollRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 320,
  });

  useEffect(() => {
    setMounted(true);
    // Inject animation keyframes into document head for previews if not present
    if (typeof document !== "undefined" && !document.getElementById("nasrify-animation-keyframes")) {
      const style = document.createElement("style");
      style.id = "nasrify-animation-keyframes";
      style.innerHTML = KEYFRAME_CSS;
      document.head.appendChild(style);
    }
  }, []);

  const config: AnimationConfig = {
    entrance: {
      ...DEFAULT_ANIMATION_CONFIG.entrance,
      ...(value?.entrance || {}),
      preset: (value?.entrance?.preset || value?.preset || "none") as AnimationPreset,
    },
    scrollTrigger: {
      ...DEFAULT_ANIMATION_CONFIG.scrollTrigger,
      ...(value?.scrollTrigger || {}),
      preset: (value?.scrollTrigger?.preset || "fadeIn") as AnimationPreset,
    },
  };

  const update = (patch: Partial<AnimationConfig>) => {
    const next: AnimationConfig = {
      ...config,
      ...patch,
    };
    onChange(next);
  };

  const openDropdown = (target: "entrance" | "scroll") => {
    setDropdownTarget(target);
    const triggerEl = target === "entrance" ? triggerEntranceRef.current : triggerScrollRef.current;
    if (triggerEl && typeof window !== "undefined") {
      const rect = triggerEl.getBoundingClientRect();
      const popupWidth = Math.max(300, rect.width);
      const popupHeight = 380;

      let left = rect.left;
      if (left + popupWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - popupWidth - 16);
      }

      // Smart flip: open upward if overflowing bottom
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldFlip = spaceBelow < popupHeight && rect.top > popupHeight;

      let top = shouldFlip ? rect.top - popupHeight - 6 : rect.bottom + 6;
      if (top < 16) top = 16;

      setCoords({ top, left, width: popupWidth });
    }
    setSearchQuery("");
    setIsDropdownOpen(true);
  };

  // Close dropdown on outside click or escape
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        triggerEntranceRef.current &&
        !triggerEntranceRef.current.contains(target) &&
        triggerScrollRef.current &&
        !triggerScrollRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const selectAnimation = (preset: AnimationPreset) => {
    if (dropdownTarget === "entrance") {
      update({
        entrance: {
          ...config.entrance,
          preset,
        },
      });
    } else {
      update({
        scrollTrigger: {
          ...config.scrollTrigger,
          preset,
        },
      });
    }
    setIsDropdownOpen(false);
  };

  const selectedPresetId =
    dropdownTarget === "entrance" ? config.entrance.preset : config.scrollTrigger.preset;

  const currentEntranceItem = ALL_ANIMATION_PRESETS.find((p) => p.id === config.entrance.preset);
  const currentScrollItem = ALL_ANIMATION_PRESETS.find((p) => p.id === config.scrollTrigger.preset);

  // Group and filter presets
  const filteredPresets = ALL_ANIMATION_PRESETS.filter((p) =>
    p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups: Array<"Basic" | "Slide" | "Zoom" | "Rotate" | "Attention" | "3D" | "Speed"> = [
    "Basic",
    "Slide",
    "Zoom",
    "Rotate",
    "Attention",
    "3D",
    "Speed",
  ];

  return (
    <div className="space-y-3 text-xs">
      <div>
        <label className="text-slate-200 font-semibold block">{label}</label>
        {description && <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>}
      </div>

      {/* Tabs: Entrance vs Scroll */}
      <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("entrance")}
          className={`py-1 rounded font-medium transition-colors ${
            activeTab === "entrance"
              ? "bg-slate-800 text-emerald-400 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Entrance
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("scroll")}
          className={`py-1 rounded font-medium transition-colors ${
            activeTab === "scroll"
              ? "bg-slate-800 text-emerald-400 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Scroll Trigger
        </button>
      </div>

      {/* ENTRANCE TAB */}
      {activeTab === "entrance" && (
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 block">Entrance Preset</label>
            <button
              ref={triggerEntranceRef}
              type="button"
              onClick={() => openDropdown("entrance")}
              className="w-full bg-slate-950 border border-slate-700 hover:border-emerald-500/60 rounded-lg py-2 px-3 text-xs text-slate-100 flex items-center justify-between transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-400 font-bold">✨</span>
                <span className="font-medium truncate">{currentEntranceItem?.label || "None"}</span>
                {currentEntranceItem?.group && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {currentEntranceItem.group}
                  </span>
                )}
              </div>
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {config.entrance.preset !== "none" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Duration</span>
                    <span className="font-mono text-slate-300">
                      {(config.entrance.duration / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="100"
                    value={config.entrance.duration}
                    onChange={(e) =>
                      update({
                        entrance: {
                          ...config.entrance,
                          duration: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Delay</span>
                    <span className="font-mono text-slate-300">
                      {(config.entrance.delay / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="100"
                    value={config.entrance.delay}
                    onChange={(e) =>
                      update({
                        entrance: {
                          ...config.entrance,
                          delay: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block">Easing</label>
                <select
                  value={config.entrance.easing}
                  onChange={(e) =>
                    update({
                      entrance: {
                        ...config.entrance,
                        easing: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="linear">Linear</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {/* SCROLL TRIGGER TAB */}
      {activeTab === "scroll" && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Enable Viewport Trigger</span>
            <button
              type="button"
              onClick={() =>
                update({
                  scrollTrigger: {
                    ...config.scrollTrigger,
                    enabled: !config.scrollTrigger.enabled,
                  },
                })
              }
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                config.scrollTrigger.enabled ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  config.scrollTrigger.enabled ? "translate-x-4.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {config.scrollTrigger.enabled && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block">Scroll Animation Preset</label>
                <button
                  ref={triggerScrollRef}
                  type="button"
                  onClick={() => openDropdown("scroll")}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-emerald-500/60 rounded-lg py-2 px-3 text-xs text-slate-100 flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-bold">🎯</span>
                    <span className="font-medium truncate">{currentScrollItem?.label || "Fade In"}</span>
                    {currentScrollItem?.group && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {currentScrollItem.group}
                      </span>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Viewport Offset Trigger</span>
                  <span className="font-mono text-slate-300">
                    {config.scrollTrigger.offsetPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={config.scrollTrigger.offsetPercent}
                  onChange={(e) =>
                    update({
                      scrollTrigger: {
                        ...config.scrollTrigger,
                        offsetPercent: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Repeat on Every Scroll</span>
                <input
                  type="checkbox"
                  checked={config.scrollTrigger.repeat}
                  onChange={(e) =>
                    update({
                      scrollTrigger: {
                        ...config.scrollTrigger,
                        repeat: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* PORTAL DROPDOWN (BUG-3 COMPLETE POPUP) */}
      {mounted &&
        isDropdownOpen &&
        typeof document !== "undefined" &&
        document.body &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: "400px",
              zIndex: 99999,
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 select-none text-xs"
          >
            {/* Search Box Header */}
            <div className="p-2.5 border-b border-slate-800 bg-slate-950/80 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 20+ animations..."
                autoFocus
                className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-white text-xs p-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Scrollable Grouped List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-2.5 custom-scrollbar">
              {filteredPresets.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">No animations matched</div>
              ) : (
                groups.map((group) => {
                  const itemsInGroup = filteredPresets.filter((p) => p.group === group);
                  if (itemsInGroup.length === 0) return null;

                  return (
                    <div key={group} className="space-y-1">
                      <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/50 rounded flex items-center justify-between">
                        <span>{group}</span>
                        <span className="text-[9px] text-slate-500 font-normal font-mono">
                          {itemsInGroup.length} items
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        {itemsInGroup.map((item) => {
                          const isSelected = item.id === selectedPresetId;
                          const isHovered = hoveredAnim === item.id;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => selectAnimation(item.id)}
                              onMouseEnter={() => setHoveredAnim(item.id)}
                              onMouseLeave={() => setHoveredAnim(null)}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer group ${
                                isSelected
                                  ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40"
                                  : "hover:bg-slate-800 text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {/* Hover Animated Preview Icon */}
                                <span
                                  className={`text-xs inline-block shrink-0 transition-transform ${
                                    isHovered && item.id !== "none" ? `anim-${item.id}` : ""
                                  }`}
                                  style={
                                    isHovered && item.id !== "none"
                                      ? { animationDuration: "0.8s", animationIterationCount: "infinite" }
                                      : undefined
                                  }
                                >
                                  {item.id === "none" ? "🚫" : "⚡"}
                                </span>
                                <span className="truncate">{item.label}</span>
                              </div>

                              {isSelected && (
                                <span className="text-emerald-400 text-xs font-bold shrink-0 ml-2">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default AnimationControl;
