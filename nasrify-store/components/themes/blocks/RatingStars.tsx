import React from "react";

export interface RatingStarsProps {
  rating?: number;
  count?: number;
  showNumber?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function RatingStars({
  rating = 5,
  count,
  showNumber = false,
  size = "sm",
  className = "",
}: RatingStarsProps) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${starSize} ${
              clampedRating >= star
                ? "fill-current"
                : clampedRating >= star - 0.5
                ? "fill-current opacity-70"
                : "text-gray-200 fill-current"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {showNumber && (
        <span className="text-xs font-medium text-[var(--theme-text,#18181B)]">
          {clampedRating.toFixed(1)}
        </span>
      )}

      {typeof count === "number" && (
        <span className="text-[11px] text-[var(--theme-text-muted,#71717A)]">
          ({count})
        </span>
      )}
    </div>
  );
}
