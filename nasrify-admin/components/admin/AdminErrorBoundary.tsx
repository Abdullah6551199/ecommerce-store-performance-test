"use client";

import React, { Component, type ReactNode } from "react";
import Link from "next/link";

interface Props {
  moduleName?: string;
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * AdminErrorBoundary protects the Admin Shell from module-level rendering errors.
 * Ensures the header, sidebar, and layout stay fully interactive even if a body module fails.
 */
export default class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(
      `[AdminErrorBoundary] Error in module "${this.props.moduleName || "AdminModule"}":`,
      error,
      errorInfo
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const moduleName = this.props.moduleName || "Admin Module";

      return (
        <div className="space-y-6 max-w-4xl p-2 animate-in fade-in duration-300">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {moduleName}
            </h1>
            <p className="mt-1 text-xs text-zinc-600 dark:text-white/60">
              An unexpected error occurred while rendering this module.
            </p>
          </div>

          <div className="rounded-3xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#1a0707] p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="flex-1 space-y-3">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Failed to render {moduleName}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {this.state.error?.message || "An unexpected client-side runtime error occurred."}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Retry Module</span>
                  </button>

                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all"
                  >
                    <span>Back to Dashboard</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
