import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface CheckboxRadioProps {
  id?: string;
  sectionId?: string;
  variant?: "checkbox" | "radio" | string;
  settings?: {
    label?: string;
    name?: string;
    checked_default?: boolean;
  };
}

export function CheckboxRadio({
  id = "checkbox_radio",
  sectionId,
  variant = "checkbox",
  settings = {},
}: CheckboxRadioProps) {
  const label = settings.label || "I agree to the Terms and Conditions";
  const name = settings.name || "terms";
  const defaultChecked = settings.checked_default ?? false;

  const isRadio = variant === "radio";

  return (
    <EditableComponent
      id={id}
      type="checkbox_radio"
      sectionId={sectionId}
      className="flex items-center gap-2.5 my-2"
    >
      <input
        type={isRadio ? "radio" : "checkbox"}
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 text-[var(--theme-accent,#2563EB)] accent-[var(--theme-accent,#2563EB)] border-[var(--theme-border,#E4E4E7)] rounded cursor-pointer"
      />
      <label className="text-xs sm:text-sm text-[var(--theme-text,#18181B)] cursor-pointer select-none">
        {label}
      </label>
    </EditableComponent>
  );
}

export default CheckboxRadio;
