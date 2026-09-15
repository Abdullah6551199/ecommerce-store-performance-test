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
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
