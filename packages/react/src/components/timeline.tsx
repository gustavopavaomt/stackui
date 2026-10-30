import type { ReactNode } from "react";

import { cx } from "../primitives/cx";

export type TimelineStepState = "done" | "error" | "current" | "upcoming";

export type TimelineStep = {
  title: string;
  /** A line under the title (the time it happened, what it is waiting for). */
  detail?: ReactNode;
  state: TimelineStepState;
};

/**
 * Where something is, like tracking a delivery: each step with a marker (check, cross, a pulsing dot for the
 * one in progress, a ring for what is ahead) joined by a line, tinted up to the last step reached.
 */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  const ultimoFeito = steps.reduce((a, s, i) => (s.state === "done" || s.state === "error" ? i : a), -1);
  return (
    <ol className="st-timeline">
      {steps.map((s, i) => {
        const ultimo = i === steps.length - 1;
        return (
          <li key={s.title} className="st-timeline__step" aria-current={s.state === "current" || (i === ultimoFeito && !steps.some((x) => x.state === "current")) ? "step" : undefined}>
            <div className="st-timeline__rail">
              <Marcador state={s.state} />
              {!ultimo && <span aria-hidden className={cx("st-timeline__line", i < ultimoFeito && "st-timeline__line--done")} />}
            </div>
            <div className={cx("st-timeline__text", !ultimo && "st-timeline__text--spaced")}>
              <span className={cx("st-timeline__title", `st-timeline__title--${s.state}`)}>{s.title}</span>
              {s.detail && <span className="st-timeline__detail">{s.detail}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Marcador({ state }: { state: TimelineStepState }) {
  if (state === "done" || state === "error")
    return (
      <span className={`st-timeline__marker st-timeline__marker--${state}`}>
        <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
          <path d={state === "done" ? "M5 12.5l4.5 4.5L19 7.5" : "M18 6L6 18M6 6l12 12"} />
        </svg>
      </span>
    );
  return <span className={`st-timeline__marker st-timeline__marker--${state}`}>{state === "current" && <span className="st-timeline__pulse" />}</span>;
}
