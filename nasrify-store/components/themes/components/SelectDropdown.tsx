import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface SelectDropdownProps {
  id?: string;
  sectionId?: string;
  settings?: {
    label?: string;
    options?: Array<{ label: string; value: string }>;
  };
}

export function SelectDropdown({
  id = "select_dropdown",
  sectionId,
  settings = {},
}: SelectDropdownProps) {
  const label = settings.label || "Preferred Courier";
  const options = settings.options?.length
    ? settings.options
    : [
        { label: "DHL Express (1-2 Days)", value: "dhl" },
        { label: "FedEx Priority (2-3 Days)", value: "fedex" },
        { label: "Standard Delivery (3-5 Days)", value: "standard" },
      ];

  return (
    <EditableComponent
      id={id}
      type="select_dropdown"
      sectionId={sectionId}
      className="space-y-1.5 my-2"
    >
      {label && (
        <label className="block text-xs font-semibold text-[var(--theme-text,#18181B)]">
          {label}
        </label>
      )}
      <select className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-[var(--theme-text,#18181B)] bg-[var(--theme-background,#FFFFFF)] border border-[var(--theme-border,#E4E4E7)] rounded-[var(--theme-radius,8px)] focus:ring-2 focus:ring-[var(--theme-accent,#2563EB)] focus:outline-hidden transition-all">
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </EditableComponent>
  );
}

export default SelectDropdown;
