import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface DividerProps {
  id?: string;
  sectionId?: string;
  variant?: "solid" | "dashed" | "dotted" | "double" | "gradient" | string;
  settings?: {
    width?: string;
    height?: number;
    alignment?: "left" | "center" | "right";
  };
}

export function Divider({
  id = "divider",
  sectionId,
  variant = "solid",
  settings = {},
}: DividerProps) {
  const width = settings.width || "100%";
  const height = settings.height || 1;
  const alignment = settings.alignment || "center";

  const alignClass =
    alignment === "left" ? "mr-auto" : alignment === "right" ? "ml-auto" : "mx-auto";

  return (
    <EditableComponent id={id} type="divider" sectionId={sectionId} className="my-4">
      <div
        className={`${alignClass} transition-all`}
        style={{
          width,
          borderBottomWidth: `${height}px`,
          borderBottomStyle: variant === "gradient" ? "solid" : (variant as any) || "solid",
          borderImage:
            variant === "gradient"
              ? "linear-gradient(90deg, transparent, var(--theme-accent, #2563EB), transparent) 1"
              : undefined,
          borderColor: variant !== "gradient" ? "var(--theme-border, #E4E4E7)" : undefined,
        }}
      />
    </EditableComponent>
  );
}

export default Divider;
