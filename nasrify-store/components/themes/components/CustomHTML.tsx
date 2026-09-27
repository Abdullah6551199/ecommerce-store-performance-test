import React from "react";
import { EditableComponent } from "../EditableComponent";
import { sanitizeHtml } from "@/lib/themes/utils";

export interface CustomHTMLProps {
  id?: string;
  sectionId?: string;
  settings?: {
    code?: string;
  };
}

export function CustomHTML({
  id = "custom_html",
  sectionId,
  settings = {},
}: CustomHTMLProps) {
  const code =
    settings.code ||
    '<div class="p-4 bg-slate-900 text-emerald-400 rounded-lg text-center font-mono text-xs">Custom HTML Embed Active</div>';

  return (
    <EditableComponent
      id={id}
      type="custom_html"
      sectionId={sectionId}
      className="my-3 overflow-hidden"
    >
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(code) }} />
    </EditableComponent>
  );
}

export default CustomHTML;
