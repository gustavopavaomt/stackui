import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cx } from "../primitives/cx";
import { ProgressView } from "./progress-view";

export type ButtonVariant = "prominent" | "bordered" | "plain" | "destructive";
export type ButtonSize = "large" | "regular" | "small";
export type ButtonState = "idle" | "loading" | "done";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** `prominent`: filled with the tint (the main action). `bordered`: gray fill. `plain`: text only. `destructive`: red. */
  variant?: ButtonVariant;
  /** `large` fills the width (the bottom action of a screen); `regular` and `small` hug their label. */
  size?: ButtonSize;
  /** An icon before the label (any element, e.g. an SVG icon component). */
  icon?: ReactNode;
  /** Async feedback in place, without changing the button size: idle → loading (spinner) → done (check). */
  state?: ButtonState;
  loadingLabel?: ReactNode;
  doneLabel?: ReactNode;
  children?: ReactNode;
};

/** Loading stays on screen at least this long, so a fast save is still noticed. */
export const MIN_LOADING_MS = 450;

function useVisibleState(state: ButtonState): ButtonState {
  const [visivel, setVisivel] = useState(state);
  const desde = useRef(0);
  useEffect(() => {
    if (state === "loading") desde.current = Date.now();
    const falta = state !== "loading" && visivel === "loading" ? Math.max(0, MIN_LOADING_MS - (Date.now() - desde.current)) : 0;
    const t = window.setTimeout(() => setVisivel(state), falta);
    return () => window.clearTimeout(t);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return visivel;
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function Button({ variant = "prominent", size = "large", icon, state = "idle", loadingLabel = "Saving…", doneLabel = "Done", disabled, className, type = "button", children, ...props }: ButtonProps) {
  const visivel = useVisibleState(state);
  const ocupado = state !== "idle" || visivel !== "idle";
  useEffect(() => {
    if (visivel === "done") navigator.vibrate?.(12);
  }, [visivel]);
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || ocupado}
      aria-busy={visivel === "loading" || undefined}
      className={cx("st-button", `st-button--${variant}`, `st-button--${size}`, visivel === "done" && "st-button--done", ocupado && "st-button--busy", className)}
    >
      {/* The key re-mounts the label, which replays the swap-in animation (CSS only). */}
      <span key={visivel} className="st-button__label" aria-live="polite">
        {visivel === "loading" ? (
          <>
            <ProgressView size={20} label={typeof loadingLabel === "string" ? loadingLabel : "Loading"} />
            {loadingLabel}
          </>
        ) : visivel === "done" ? (
          <>
            <Check />
            {doneLabel}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </span>
    </button>
  );
}
