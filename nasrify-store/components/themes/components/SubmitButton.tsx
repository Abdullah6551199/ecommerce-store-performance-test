import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface SubmitButtonProps {
  id?: string;
  sectionId?: string;
  variant?: "primary" | "dark" | string;
  settings?: {
    text?: string;
    full_width?: boolean;
  };
}

export function SubmitButton({
  id = "submit_button",
  sectionId,
  variant = "primary",
  settings = {},
}: SubmitButtonProps) {
  const text = settings.text || "Send Message";
  const fullWidth = settings.full_width ?? false;

  const isPrimary = variant === "primary";

  return (
    <EditableComponent
      id={id}
      type="submit_button"
      sectionId={sectionId}
      className={`my-2 ${fullWidth ? "w-full" : "inline-block"}`}
    >
      <button
        type="submit"
        className={`py-3 px-6 rounded-[var(--theme-radius,8px)] font-bold text-xs sm:text-sm transition-all shadow-xs ${
          fullWidth ? "w-full" : ""
        } ${
          isPrimary
            ? "bg-[var(--theme-primary,#18181B)] text-white hover:bg-[var(--theme-accent,#2563EB)]"
            : "bg-black text-white hover:opacity-90"
        }`}
      >
        {text}
      </button>
    </EditableComponent>
  );
}

export default SubmitButton;
