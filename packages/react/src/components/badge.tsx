import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "tint" | "success" | "warning" | "danger";

/** A small status capsule. Color and text, never color alone. */
export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`st-badge st-badge--${tone}`}>{children}</span>;
}
