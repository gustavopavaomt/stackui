import { cx } from "../primitives/cx";

export type ProgressViewProps = {
  /** Diameter in px. Default 28. */
  size?: number;
  /** Read by screen readers. Default "Loading". */
  label?: string;
  className?: string;
};

/** The activity indicator: eight spokes that light up in turn. Takes the current text color. */
export function ProgressView({ size = 28, label = "Loading", className }: ProgressViewProps) {
  return (
    <span role="progressbar" aria-label={label} className={cx("st-progress", className)}>
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="14.5" y="2" width="3" height="8.5" rx="1.5" fill="currentColor" transform={`rotate(${i * 45} 16 16)`} opacity={0.25 + (i / 8) * 0.75} />
        ))}
      </svg>
    </span>
  );
}
