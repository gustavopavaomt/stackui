import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { cx } from "../primitives/cx";

export type SkeletonProps = { width?: CSSProperties["width"]; height?: CSSProperties["height"]; radius?: CSSProperties["borderRadius"]; circle?: boolean };

/** A placeholder block with a shimmer: the shape of content that is still coming. */
export function Skeleton({ width = "100%", height = 14, radius, circle }: SkeletonProps) {
  return <span aria-hidden className="st-skeleton" style={{ width, height, borderRadius: circle ? 999 : radius }} />;
}

/** Lines of text; the last one shorter, like a real paragraph. */
export function SkeletonText({ lines = 2 }: { lines?: number }) {
  return (
    <span aria-hidden className="st-skeleton-text">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 && lines > 1 ? "60%" : "100%"} />
      ))}
    </span>
  );
}

/** Widths that vary row by row (always the same: the skeleton does not jump on re-render). */
const LARGURAS = [
  ["68%", "44%"],
  ["52%", "60%"],
  ["74%", "38%"],
  ["58%", "52%"],
  ["66%", "46%"],
];

export type SkeletonListProps = {
  rows?: number;
  /** A round avatar or a square photo before the text. */
  leading?: "circle" | "square";
  /** A short value on the trailing side (a price). */
  trailing?: boolean;
  /** Read by screen readers. */
  label?: string;
};

/** Ghost rows in the shape of real `Row`s. Put it inside a `Section`, where the rows will be. */
export function SkeletonList({ rows = 6, leading, trailing, label = "Loading…" }: SkeletonListProps) {
  return (
    <div role="status" aria-live="polite">
      <span className="st-visually-hidden">{label}</span>
      {Array.from({ length: rows }, (_, i) => {
        const [a, b] = LARGURAS[i % LARGURAS.length];
        return (
          <div key={i} aria-hidden className={cx("st-row st-skeleton-row", leading && "st-row--leading")}>
            {leading && <Skeleton width={44} height={44} radius={leading === "circle" ? 999 : 10} />}
            <span className="st-skeleton-row__text">
              <Skeleton width={a} height={16} />
              <Skeleton width={b} />
            </span>
            {trailing && <Skeleton width={56} height={16} />}
          </div>
        );
      })}
    </div>
  );
}

/** A short wait does not deserve a skeleton: the eye misses it, but sees the flash. */
export const REDACTED_DELAY_MS = 200;

export type RedactedProps = {
  /** True while the data has not arrived yet (not for an empty list, which has its own message). */
  isLoading: boolean;
  /** What to show meanwhile (a `SkeletonList`, a `Skeleton`…). */
  placeholder: ReactNode;
  /** Show the placeholder only if the wait lasts this long. */
  delay?: number;
  children: ReactNode;
};

/**
 * Content that depends on data still coming. The placeholder appears only after `delay` (local data usually wins
 * and shows straight away); content that arrives after the placeholder showed fades in.
 */
export function Redacted({ isLoading, placeholder, delay = REDACTED_DELAY_MS, children }: RedactedProps) {
  const [venceu, setVenceu] = useState(false);
  const [veioDoEsqueleto, setVeioDoEsqueleto] = useState(false);
  useEffect(() => {
    if (!isLoading) return;
    const t = window.setTimeout(() => setVenceu(true), delay);
    return () => {
      window.clearTimeout(t);
      setVenceu(false);
    };
  }, [isLoading, delay]);
  const mostrar = isLoading && venceu;
  // Remembers that the placeholder showed (derived during render, no cascading effect).
  if (mostrar && !veioDoEsqueleto) setVeioDoEsqueleto(true);
  if (isLoading) return mostrar ? placeholder : null;
  return veioDoEsqueleto ? <div className="st-fade-in">{children}</div> : children;
}
