"use client";

import React, { useEffect, useRef, useState } from "react";
import { EditableComponent } from "../EditableComponent";

export interface CounterProps {
  id?: string;
  sectionId?: string;
  settings?: {
    number?: number;
    prefix?: string;
    suffix?: string;
    title?: string;
  };
}

export function Counter({
  id = "counter",
  sectionId,
  settings = {},
}: CounterProps) {
  const target = settings.number ?? 50000;
  const prefix = settings.prefix ?? "+";
  const suffix = settings.suffix ?? "";
  const title = settings.title || "Satisfied Customers";

  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1200;
          const steps = 40;
          const stepTime = duration / steps;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, stepTime);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <EditableComponent
      id={id}
      type="counter"
      sectionId={sectionId}
      className="p-4 text-center"
    >
      <div ref={ref} className="inline-block">
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-mono">
          <span>{prefix}</span>
          <span>{count.toLocaleString()}</span>
          <span>{suffix}</span>
        </div>
        <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--theme-text-muted,#71717A)]">
          {title}
        </p>
      </div>
    </EditableComponent>
  );
}

export default Counter;
