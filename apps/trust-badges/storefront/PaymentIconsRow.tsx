"use client";

import React, { useEffect, useState } from "react";
import type { PaymentIconItem } from "../shared/types";

interface PaymentIconsRowProps {
  className?: string;
  itemClassName?: string;
  initialIcons?: PaymentIconItem[];
}

import { StandardPaymentSvg } from "../shared/payment-icons";
export { StandardPaymentSvg };

export default function PaymentIconsRow({
  className = "",
  itemClassName = "",
  initialIcons,
}: PaymentIconsRowProps): React.JSX.Element | null {
  const [icons, setIcons] = useState<PaymentIconItem[]>(initialIcons || []);
  const [loading, setLoading] = useState(!initialIcons || initialIcons.length === 0);

  useEffect(() => {
    if (!initialIcons || initialIcons.length === 0) {
      fetch("/api/payment-icons")
        .then((res) => res.json() as Promise<any>)
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setIcons(json.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [initialIcons]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 w-9 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (icons.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      {icons.map((icon) => (
        <div
          key={icon.id}
          className={`shrink-0 transition-transform hover:scale-105 ${itemClassName}`}
          title={icon.name}
        >
          {icon.iconSvg ? (
            <div
              className="h-6 w-auto"
              dangerouslySetInnerHTML={{ __html: icon.iconSvg }}
            />
          ) : (
            <StandardPaymentSvg name={icon.name} />
          )}
        </div>
      ))}
    </div>
  );
}
