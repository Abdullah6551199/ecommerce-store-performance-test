"use client";

import React from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  description?: string;
  id?: string;
  name?: string;
  className?: string;
}

/**
 * Reusable Shopify-style Flat Toggle Switch
 * Accessible: role="switch", aria-checked, keyboard support (Space / Enter), focus ring
 * Supports prefers-reduced-motion and customizable sizes (sm, md, lg)
 */
export default function Toggle({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
  description,
  id,
  name,
  className = "",
}: ToggleProps): React.JSX.Element {
  const switchId = id || (name ? `toggle-${name}` : undefined);

  // Height: 20px (sm), 24px (md), 28px (lg)
  // Width: roughly 2x height
  const sizeStyles = {
    sm: {
      track: "h-5 w-[38px] p-0.5",
      knob: "h-4 w-4",
      translate: "translate-x-[18px]",
    },
    md: {
      track: "h-6 w-[44px] p-0.5",
      knob: "h-5 w-5",
      translate: "translate-x-[20px]",
    },
    lg: {
      track: "h-7 w-[52px] p-0.5",
      knob: "h-6 w-6",
      translate: "translate-x-[24px]",
    },
  }[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  const switchButton = (
    <button
      type="button"
      role="switch"
      id={switchId}
      aria-checked={checked}
      aria-label={label || name || "Toggle switch"}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex shrink-0 cursor-pointer rounded-full
        transition-colors duration-200 ease-in-out
        motion-reduce:transition-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-zinc-950
        ${checked ? "bg-[var(--primary,#9333ea)] bg-purple-600" : "bg-gray-300 dark:bg-zinc-700"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${sizeStyles.track}
        ${className}
      `.trim()}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0
          transition-transform duration-200 ease-in-out
          motion-reduce:transition-none
          ${sizeStyles.knob}
          ${checked ? sizeStyles.translate : "translate-x-0"}
        `.trim()}
      />
    </button>
  );

  if (!label && !description) {
    return switchButton;
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div
        className={`flex flex-col select-none ${disabled ? "opacity-50" : "cursor-pointer"}`}
        onClick={handleToggle}
      >
        {label && (
          <span className="text-xs font-semibold text-zinc-900 dark:text-white">
            {label}
          </span>
        )}
        {description && (
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {description}
          </span>
        )}
      </div>
      {switchButton}
    </div>
  );
}
