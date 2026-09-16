"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  appId: string;
  extensionPoint: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Isolates third-party app failures so they cannot break host application rendering.
 * Automatically logs runtime errors to D1 app_install_log.
 */
export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.warn(
      `[AppErrorBoundary] App "${this.props.appId}" failed at extension point "${this.props.extensionPoint}":`,
      error,
      info
    );

    // Telemetry: record runtime error to backend audit log
    try {
      fetch("/api/apps/runtime-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: this.props.appId,
          extensionPoint: this.props.extensionPoint,
          message: error.message || String(error),
        }),
      }).catch(() => {});
    } catch {}
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
