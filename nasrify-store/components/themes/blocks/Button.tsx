import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs font-medium",
    md: "px-4 py-2 text-sm font-semibold",
    lg: "px-6 py-3 text-base font-bold",
  };

  let variantClass = "";
  let dynamicStyle: React.CSSProperties = {
    borderRadius: "var(--theme-button-radius, var(--theme-radius, 8px))",
    ...style,
  };

  if (variant === "primary") {
    variantClass =
      "bg-[var(--theme-primary,#25D366)] hover:bg-[var(--theme-primary-dark,#1EA855)] text-white shadow-sm transition-all duration-200";
  } else if (variant === "secondary") {
    variantClass =
      "bg-[var(--theme-surface,#F4F4F5)] hover:bg-gray-200 text-[var(--theme-text,#18181B)] border border-[var(--theme-border,#E4E4E7)] transition-all duration-200";
  } else if (variant === "outline") {
    variantClass =
      "border border-[var(--theme-border,#E4E4E7)] bg-transparent hover:bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text,#18181B)] transition-all duration-200";
  } else if (variant === "ghost") {
    variantClass =
      "bg-transparent hover:bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text,#18181B)] transition-all duration-200";
  }

  return (
    <button
      disabled={disabled || isLoading}
      style={dynamicStyle}
      className={`inline-flex items-center justify-center gap-2 cursor-pointer font-[family-name:var(--theme-font-body)] disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? "w-full" : ""
      } ${sizeClasses[size]} ${variantClass} ${className}`}
      {...rest}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
