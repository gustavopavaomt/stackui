import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "./button";
import { ContentUnavailableView } from "./content-unavailable-view";

export type ErrorBoundaryProps = {
  children: ReactNode;
  /** Your own screen; `reset` draws the children again. */
  fallback?: (reset: () => void) => ReactNode;
  /** Report it (your log, your monitoring). */
  onError?: (error: unknown, componentStack: string) => void;
  /** Texts of the default screen (translate them). */
  title?: string;
  description?: ReactNode;
  retryLabel?: string;
};

/**
 * An error in a screen never leaves an installed app blank with no way out: it shows what happened in plain
 * words and a way to try again.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { erro: boolean }> {
  state = { erro: false };

  static getDerivedStateFromError() {
    return { erro: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(error, info.componentStack ?? "");
  }

  reset = () => this.setState({ erro: false });

  render() {
    if (!this.state.erro) return this.props.children;
    const { fallback, title = "Something went wrong", description, retryLabel = "Try again" } = this.props;
    if (fallback) return fallback(this.reset);
    return (
      <div role="alert">
        <ContentUnavailableView
          title={title}
          description={description}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l10 18H2L12 3zm0 7v4m0 3.5h.01" />
            </svg>
          }
          actions={<Button onClick={this.reset}>{retryLabel}</Button>}
        />
      </div>
    );
  }
}
