"use client";

import React, { createContext, useContext, useState } from "react";

export type DeviceBreakpoint = "desktop" | "tablet" | "mobile";

export interface ResponsiveValue<T> {
  desktop?: T;
  tablet?: T;
  mobile?: T;
}

interface ResponsiveContextType {
  activeDevice: DeviceBreakpoint;
  setActiveDevice: (device: DeviceBreakpoint) => void;
}

const ResponsiveContext = createContext<ResponsiveContextType>({
  activeDevice: "desktop",
  setActiveDevice: () => {},
});

export function ResponsiveProvider({
  children,
  device = "desktop",
  onDeviceChange,
}: {
  children: React.ReactNode;
  device?: DeviceBreakpoint;
  onDeviceChange?: (d: DeviceBreakpoint) => void;
}) {
  const [internalDevice, setInternalDevice] = useState<DeviceBreakpoint>(device);

  const activeDevice = onDeviceChange ? device : internalDevice;
  const setActiveDevice = onDeviceChange || setInternalDevice;

  return (
    <ResponsiveContext.Provider value={{ activeDevice, setActiveDevice }}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsiveDevice() {
  return useContext(ResponsiveContext);
}

interface ResponsiveControlProps<T> {
  label: string;
  value?: ResponsiveValue<T> | T;
  onChange: (val: ResponsiveValue<T>) => void;
  renderControl: (currentVal: T | undefined, updateCurrent: (val: T) => void) => React.ReactNode;
  description?: string;
}

export function ResponsiveControl<T>({
  label,
  value,
  onChange,
  renderControl,
  description,
}: ResponsiveControlProps<T>) {
  const { activeDevice, setActiveDevice } = useResponsiveDevice();

  const respObj: ResponsiveValue<T> =
    typeof value === "object" && value !== null && ("desktop" in value || "tablet" in value || "mobile" in value)
      ? (value as ResponsiveValue<T>)
      : { desktop: value as T };

  const hasTabletOverride = respObj.tablet !== undefined;
  const hasMobileOverride = respObj.mobile !== undefined;

  const currentVal =
    respObj[activeDevice] !== undefined ? respObj[activeDevice] : respObj.desktop;

  const handleUpdate = (val: T) => {
    onChange({
      ...respObj,
      [activeDevice]: val,
    });
  };

  const handleResetCurrent = () => {
    if (activeDevice === "desktop") return;
    const next = { ...respObj };
    delete next[activeDevice];
    onChange(next);
  };

  const handleCopyFromDesktop = () => {
    if (activeDevice === "desktop" || respObj.desktop === undefined) return;
    onChange({
      ...respObj,
      [activeDevice]: respObj.desktop,
    });
  };

  return (
    <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            {label}
          </span>
          {activeDevice !== "desktop" && respObj[activeDevice] !== undefined && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"
              title="Custom override active for this device"
            />
          )}
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveDevice("desktop")}
            title="Desktop (1025px+)"
            className={`p-1 rounded text-xs transition-colors ${
              activeDevice === "desktop"
                ? "bg-slate-800 text-green-400 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🖥️
          </button>
          <button
            type="button"
            onClick={() => setActiveDevice("tablet")}
            title="Tablet (768px - 1024px)"
            className={`p-1 rounded text-xs relative transition-colors ${
              activeDevice === "tablet"
                ? "bg-slate-800 text-green-400 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📱
            {hasTabletOverride && (
              <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-blue-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveDevice("mobile")}
            title="Mobile (≤767px)"
            className={`p-1 rounded text-xs relative transition-colors ${
              activeDevice === "mobile"
                ? "bg-slate-800 text-green-400 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📱
            {hasMobileOverride && (
              <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-blue-400" />
            )}
          </button>
        </div>
      </div>

      {description && <p className="text-[11px] text-slate-400">{description}</p>}

      {activeDevice !== "desktop" && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
          <span>Editing for: <strong className="text-slate-200 capitalize">{activeDevice}</strong></span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFromDesktop}
              className="hover:text-green-400 transition-colors"
            >
              Copy Desktop
            </button>
            {respObj[activeDevice] !== undefined && (
              <button
                type="button"
                onClick={handleResetCurrent}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Reset Override
              </button>
            )}
          </div>
        </div>
      )}

      <div>{renderControl(currentVal, handleUpdate)}</div>
    </div>
  );
}
