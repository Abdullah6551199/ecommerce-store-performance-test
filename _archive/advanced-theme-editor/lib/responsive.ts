/**
 * Responsive breakpoint utilities for Stage 42.6
 */

import { BreakpointConfig, BreakpointDevice, ResponsiveValue } from '../shared/types';

export const DEFAULT_BREAKPOINTS: BreakpointConfig[] = [
  { name: 'tablet', width: 1024 },
  { name: 'mobile', width: 767 },
];

export function getResponsiveValue<T>(
  val: ResponsiveValue<T> | undefined,
  device: BreakpointDevice,
  fallback?: T
): T | undefined {
  if (!val) return fallback;
  if (device === 'mobile') {
    return val.mobile ?? val.tablet ?? val.desktop ?? fallback;
  }
  if (device === 'tablet') {
    return val.tablet ?? val.desktop ?? fallback;
  }
  return val.desktop ?? fallback;
}

export function setResponsiveValue<T>(
  prev: ResponsiveValue<T> | undefined,
  device: BreakpointDevice,
  value: T | undefined
): ResponsiveValue<T> {
  const current = { ...(prev || {}) };
  if (value === undefined) {
    delete current[device];
  } else {
    current[device] = value;
  }
  return current;
}

export function buildMediaQuery(
  device: 'tablet' | 'mobile',
  breakpoints: BreakpointConfig[] = DEFAULT_BREAKPOINTS
): string {
  const bp = breakpoints.find((b) => b.name === device);
  const width = bp ? bp.width : device === 'tablet' ? 1024 : 767;
  return `@media (max-width: ${width}px)`;
}
