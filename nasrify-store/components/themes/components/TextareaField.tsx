import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface TextareaFieldProps {
  id?: string;
  sectionId?: string;
  settings?: {
    label?: string;
    placeholder?: string;
    rows?: number;
    required?: boolean;
  };
}

export function TextareaField({
  id = "textarea_field",
  sectionId,
  settings = {},
}: TextareaFieldProps) {
  const label = settings.label || "Order Notes / Inquiries";
  const placeholder = settings.placeholder || "Type your message here...";
  const rows = settings.rows ?? 4;
  const required = settings.required ?? false;

  return (
    <EditableComponent
      id={id}
      type="textarea_field"
      sectionId={sectionId}
      className="space-y-1.5 my-2"
    >
      {label && (
        <label className="block text-xs font-semibold text-[var(--theme-text,#18181B)]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-[var(--theme-text,#18181B)] bg-[var(--theme-background,#FFFFFF)] border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] focus:ring-2 focus:ring-[var(--theme-accent,#2563EB)] focus:outline-hidden transition-all resize-y"
      />
    </EditableComponent>
  );
}

export default TextareaField;
