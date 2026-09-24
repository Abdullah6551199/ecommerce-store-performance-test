import React from "react";

export interface BadgeProps {
  text: string;
  variant?: "sale" | "new" | "primary" | "outline" | "secondary";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({
  text,
  variant = "primary",
  size = "sm",
  className = "",
}: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  let variantClasses = "";
  let variantStyle: React.CSSProperties = {};

  switch (variant) {
    case "sale":
      variantClasses = "font-bold text-red-700 bg-red-100 border border-red-200";
      break;
    case "new":
      variantStyle = {
        backgroundColor: "var(--theme-primary-light, #DCFCE7)",
        color: "var(--theme-primary-dark, #1EA855)",
        borderColor: "var(--theme-primary, #25D366)",
      };
      variantClasses = "font-semibold border border-opacity-30";
      break;
    case "outline":
      variantClasses = "border border-[var(--theme-border,#E4E4E7)] text-[var(--theme-text,#18181B)] bg-transparent";
      break;
    case "secondary":
      variantClasses = "bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text-muted,#71717A)]";
      break;
    case "primary":
    default:
      variantStyle = {
        backgroundColor: "var(--theme-primary, #25D366)",
        color: "#FFFFFF",
      };
      variantClasses = "font-semibold";
      break;
  }

  return (
    <span
      style={{
        borderRadius: "var(--theme-radius, 8px)",
        ...variantStyle,
      }}
      className={`inline-flex items-center justify-center uppercase tracking-wider ${sizeClasses} ${variantClasses} ${className}`}
    >
      {text}
    </span>
  );
}
