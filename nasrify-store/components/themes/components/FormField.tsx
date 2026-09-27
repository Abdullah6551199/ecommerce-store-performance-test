import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface FormFieldProps {
  id?: string;
  sectionId?: string;
  variant?: "standard" | "underlined" | string;
  settings?: {
    label?: string;
    placeholder?: string;
    input_type?: "text" | "email" | "tel" | "number";
    required?: boolean;
  };
}

export function FormField({
  id = "form_field",
  sectionId,
  variant = "standard",
  settings = {},
}: FormFieldProps) {
  const label = settings.label || "Email Address";
  const placeholder = settings.placeholder || "name@example.com";
  const inputType = settings.input_type || "text";
  const required = settings.required !== false;

  const isUnderlined = variant === "underlined";

  return (
    <EditableComponent
      id={id}
      type="form_field"
      sectionId={sectionId}
      className="space-y-1.5 my-2"
    >
      {label && (
        <label className="block text-xs font-semibold text-[var(--theme-text,#18181B)]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        type={inputType}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3.5 py-2.5 text-xs sm:text-sm text-[var(--theme-text,#18181B)] bg-[var(--theme-background,#FFFFFF)] transition-all focus:outline-hidden ${
          isUnderlined
            ? "border-b-2 border-[var(--theme-border,#E4E4E7)] focus:border-[var(--theme-accent,#2563EB)] rounded-none px-0"
            : "border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] focus:ring-2 focus:ring-[var(--theme-accent,#2563EB)]"
        }`}
      />
    </EditableComponent>
  );
}

export default FormField;
