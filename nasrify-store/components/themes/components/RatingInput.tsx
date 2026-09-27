"use client";

import React, { useState } from "react";
import { EditableComponent } from "../EditableComponent";

export interface RatingInputProps {
  id?: string;
  sectionId?: string;
  settings?: {
    label?: string;
    default_rating?: number;
  };
  value?: number;
  onChange?: (rating: number) => void;
}

export function RatingInput({
  id = "rating_input",
  sectionId,
  settings = {},
  value: controlledValue,
  onChange,
}: RatingInputProps) {
  const label = settings.label || "Your Rating";
  const defaultRating = settings.default_rating ?? 5;

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [internalRating, setInternalRating] = useState(defaultRating);

  const current = controlledValue !== undefined ? controlledValue : internalRating;
  const display = hoverRating !== null ? hoverRating : current;

  const handleClick = (r: number) => {
    setInternalRating(r);
    onChange?.(r);
  };

  return (
    <EditableComponent
      id={id}
      type="rating_input"
      sectionId={sectionId}
      className="space-y-1 my-2"
    >
      {label && <label className="block text-xs font-semibold text-[var(--theme-text,#18181B)]">{label}</label>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            className="text-2xl text-amber-400 hover:scale-125 transition-transform focus:outline-hidden"
            aria-label={`Rate ${star} star`}
          >
            {star <= display ? "★" : "☆"}
          </button>
        ))}
        <span className="text-xs font-semibold text-[var(--theme-text-muted,#71717A)] ml-2">
          {display} / 5
        </span>
      </div>
    </EditableComponent>
  );
}

export default RatingInput;
