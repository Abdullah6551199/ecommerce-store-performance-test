"use client";

import React, { useState } from "react";

export type AnimationPreset =
  | "none"
  | "fadeIn"
  | "slideInUp"
  | "slideInDown"
  | "slideInLeft"
  | "slideInRight"
  | "zoomIn"
  | "zoomOut"
  | "bounceIn"
  | "flipInX"
  | "flipInY"
  | "rotateIn"
  | "pulse"
  | "swing"
  | "wobble"
  | "jello"
  | "heartBeat"
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

export const ANIMATION_PRESETS: { id: AnimationPreset; label: string; group: string }[] = [
  { id: "none", label: "None", group: "Basic" },
  { id: "fadeIn", label: "Fade In", group: "Fade" },
  { id: "slideInUp", label: "Slide In Up", group: "Slide" },
  { id: "slideInDown", label: "Slide In Down", group: "Slide" },
  { id: "slideInLeft", label: "Slide In Left", group: "Slide" },
  { id: "slideInRight", label: "Slide In Right", group: "Slide" },
  { id: "zoomIn", label: "Zoom In", group: "Zoom" },
  { id: "zoomOut", label: "Zoom Out", group: "Zoom" },
  { id: "bounceIn", label: "Bounce In", group: "Attention" },
  { id: "flipInX", label: "Flip In X", group: "3D" },
  { id: "flipInY", label: "Flip In Y", group: "3D" },
  { id: "rotateIn", label: "Rotate In", group: "Rotate" },
  { id: "pulse", label: "Pulse", group: "Attention" },
  { id: "swing", label: "Swing", group: "Attention" },
  { id: "wobble", label: "Wobble", group: "Attention" },
  { id: "jello", label: "Jello", group: "Attention" },
  { id: "heartBeat", label: "Heart Beat", group: "Attention" },
  { id: "flash", label: "Flash", group: "Attention" },
  { id: "rubberBand", label: "Rubber Band", group: "Attention" },
  { id: "backInUp", label: "Back In Up", group: "Slide" },
  { id: "lightSpeedInRight", label: "Light Speed", group: "Speed" },
];

export const KEYFRAME_CSS = `
@keyframes anim-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes anim-slideInUp { from { transform: translate3d(0, 40px, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-slideInDown { from { transform: translate3d(0, -40px, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-slideInLeft { from { transform: translate3d(-40px, 0, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-slideInRight { from { transform: translate3d(40px, 0, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-zoomIn { from { opacity: 0; transform: scale3d(0.7, 0.7, 0.7); } 50% { opacity: 1; } to { transform: scale3d(1, 1, 1); } }
@keyframes anim-zoomOut { from { opacity: 1; } 50% { opacity: 0.8; transform: scale3d(0.8, 0.8, 0.8); } to { opacity: 1; transform: scale3d(1, 1, 1); } }
@keyframes anim-bounceIn { 0%, 20%, 40%, 60%, 80%, 100% { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 20% { transform: scale3d(1.1, 1.1, 1.1); } 40% { transform: scale3d(0.9, 0.9, 0.9); } 60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); } 80% { transform: scale3d(0.97, 0.97, 0.97); } 100% { opacity: 1; transform: scale3d(1, 1, 1); } }
@keyframes anim-flipInX { from { transform: perspective(400px) rotate3d(1, 0, 0, 90deg); opacity: 0; } 40% { transform: perspective(400px) rotate3d(1, 0, 0, -20deg); } 60% { transform: perspective(400px) rotate3d(1, 0, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(1, 0, 0, -5deg); } to { transform: perspective(400px); } }
@keyframes anim-flipInY { from { transform: perspective(400px) rotate3d(0, 1, 0, 90deg); opacity: 0; } 40% { transform: perspective(400px) rotate3d(0, 1, 0, -20deg); } 60% { transform: perspective(400px) rotate3d(0, 1, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(0, 1, 0, -5deg); } to { transform: perspective(400px); } }
@keyframes anim-rotateIn { from { transform: rotate3d(0, 0, 1, -200deg); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-pulse { 0% { transform: scale3d(1, 1, 1); } 50% { transform: scale3d(1.05, 1.05, 1.05); } 100% { transform: scale3d(1, 1, 1); } }
@keyframes anim-swing { 20% { transform: rotate3d(0, 0, 1, 15deg); } 40% { transform: rotate3d(0, 0, 1, -10deg); } 60% { transform: rotate3d(0, 0, 1, 5deg); } 80% { transform: rotate3d(0, 0, 1, -5deg); } 100% { transform: rotate3d(0, 0, 1, 0deg); } }
@keyframes anim-wobble { 0% { transform: translate3d(0, 0, 0); } 15% { transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg); } 30% { transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg); } 45% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg); } 60% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg); } 75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); } 100% { transform: translate3d(0, 0, 0); } }
@keyframes anim-jello { 0%, 11.1%, 100% { transform: translate3d(0, 0, 0); } 22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); } 66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); } 77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); } 88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); } }
@keyframes anim-heartBeat { 0% { transform: scale(1); } 14% { transform: scale(1.15); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }
@keyframes anim-flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0; } }
@keyframes anim-rubberBand { 0% { transform: scale3d(1, 1, 1); } 30% { transform: scale3d(1.25, 0.75, 1); } 40% { transform: scale3d(0.75, 1.25, 1); } 50% { transform: scale3d(1.15, 0.85, 1); } 65% { transform: scale3d(0.95, 1.05, 1); } 75% { transform: scale3d(1.05, 0.95, 1); } 100% { transform: scale3d(1, 1, 1); } }
@keyframes anim-backInUp { 0% { transform: translateY(800px) scale(0.7); opacity: 0.7; } 80% { transform: translateY(0px) scale(0.7); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
@keyframes anim-lightSpeedInRight { from { transform: translate3d(100%, 0, 0) skewX(-30deg); opacity: 0; } 60% { transform: skewX(20deg); opacity: 1; } 80% { transform: skewX(-5deg); } to { transform: translate3d(0, 0, 0); } }
`;

interface AnimationControlProps {
  label?: string;
  value?: Partial<AnimationConfig>;
  onChange: (cfg: AnimationConfig) => void;
  description?: string;
}

export function AnimationControl({
  label = "Motion & Animations",
  value,
  onChange,
  description,
}: AnimationControlProps) {
  const config: AnimationConfig = {
    entrance: { ...DEFAULT_ANIMATION_CONFIG.entrance, ...value?.entrance },
    scrollTrigger: { ...DEFAULT_ANIMATION_CONFIG.scrollTrigger, ...value?.scrollTrigger },
  };

  const [activeTab, setActiveTab] = useState<"entrance" | "scroll">("entrance");
  const [replayKey, setReplayKey] = useState(0);

  const update = (partial: Partial<AnimationConfig>) => {
    onChange({ ...config, ...partial });
  };

  const triggerReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  return (
    <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 space-y-4">
      {/* Inject animations in preview frame if not present */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAME_CSS }} />

      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            {label}
          </label>
          {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
        </div>
        <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("entrance")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "entrance"
                ? "bg-slate-800 text-green-400 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Entrance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("scroll")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "scroll"
                ? "bg-slate-800 text-green-400 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Scroll Reveal
          </button>
        </div>
      </div>

      {activeTab === "entrance" && (
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Entrance Animation</span>
              <button
                type="button"
                onClick={triggerReplay}
                className="text-xs text-green-400 hover:text-green-300 font-medium flex items-center gap-1"
              >
                <span>↺</span> Replay
              </button>
            </div>
            <select
              value={config.entrance.preset}
              onChange={(e) => {
                update({
                  entrance: {
                    ...config.entrance,
                    preset: e.target.value as AnimationPreset,
                  },
                });
                triggerReplay();
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              {ANIMATION_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.group})
                </option>
              ))}
            </select>
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
                    className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
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
                    className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
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
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                config.scrollTrigger.enabled ? "bg-green-500" : "bg-slate-700"
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
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Scroll Animation Preset</label>
                <select
                  value={config.scrollTrigger.preset}
                  onChange={(e) =>
                    update({
                      scrollTrigger: {
                        ...config.scrollTrigger,
                        preset: e.target.value as AnimationPreset,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  {ANIMATION_PRESETS.filter((p) => p.id !== "none").map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
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
                  className="w-full accent-green-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Repeat Every Time in View</span>
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
                  className="rounded border-slate-700 bg-slate-950 text-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Preview Box */}
      <div className="pt-2">
        <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider flex justify-between">
          <span>Animation Preview</span>
          <button
            type="button"
            onClick={triggerReplay}
            className="text-[10px] text-green-400 hover:underline"
          >
            Replay
          </button>
        </div>
        <div className="h-20 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
          <div
            key={replayKey}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-xs font-semibold text-slate-950 shadow-md select-none"
            style={{
              animationName:
                config.entrance.preset !== "none"
                  ? `anim-${config.entrance.preset}`
                  : undefined,
              animationDuration: `${config.entrance.duration}ms`,
              animationDelay: `${config.entrance.delay}ms`,
              animationTimingFunction: config.entrance.easing,
              animationFillMode: "both",
            }}
          >
            {config.entrance.preset !== "none" ? config.entrance.preset : "No Animation"}
          </div>
        </div>
      </div>
    </div>
  );
}
