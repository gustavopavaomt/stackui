import type { ReactNode } from "react";

export type ProgressStep = { text: ReactNode; icon?: ReactNode };

/**
 * "Do this, then this": a numbered list in a section card. The number sits in a tinted circle; an icon on the
 * trailing side when the gesture has a symbol on the device (the Share button, the browser menu).
 */
export function ProgressSteps({ steps }: { steps: ProgressStep[] }) {
  return (
    <ol className="st-section__card st-steps">
      {steps.map((s, i) => (
        <li key={i} className="st-row st-steps__step">
          <span className="st-steps__number" aria-hidden>
            {i + 1}
          </span>
          <span className="st-steps__text">{s.text}</span>
          {s.icon && <span className="st-steps__icon">{s.icon}</span>}
        </li>
      ))}
    </ol>
  );
}
