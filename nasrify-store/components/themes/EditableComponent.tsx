"use client";

import React from "react";

export interface EditableComponentProps {
  id: string;
  type: string;
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  children: React.ReactNode;
  [key: string]: any;
}

/**
 * EditableComponent (Stage 47)
 * Wraps any component with hover/inspection attributes for theme editor preview mode.
 * Zero runtime overhead in production.
 */
export function EditableComponent({
  id,
  type,
  sectionId,
  className = "",
  style,
  as: Component = "div",
  children,
  ...rest
}: EditableComponentProps) {
  return (
    <Component
      data-component-id={id}
      data-component-type={type}
      data-section-id={sectionId}
      className={`component-${id} ${className}`.trim()}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default EditableComponent;
