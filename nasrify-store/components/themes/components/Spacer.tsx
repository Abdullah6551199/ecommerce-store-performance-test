import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface SpacerProps {
  id?: string;
  sectionId?: string;
  settings?: {
    height_desktop?: number;
    height_mobile?: number;
  };
}

export function Spacer({
  id = "spacer",
  sectionId,
  settings = {},
}: SpacerProps) {
  const heightDesktop = settings.height_desktop ?? 32;
  const heightMobile = settings.height_mobile ?? 20;

  return (
    <EditableComponent id={id} type="spacer" sectionId={sectionId} className="w-full">
      <div
        className="w-full transition-all"
        style={{
          height: `var(--spacer-height, ${heightDesktop}px)`,
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 767px) {
              .component-${id} > div { height: ${heightMobile}px !important; }
            }
          `
        }} />
      </div>
    </EditableComponent>
  );
}

export default Spacer;
