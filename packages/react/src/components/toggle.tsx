import { cx } from "../primitives/cx";

export type ToggleProps = {
  isOn: boolean;
  onChange: (isOn: boolean) => void;
  /** What it turns on, for screen readers (or point to a visible label with `aria-labelledby`). */
  label?: string;
  "aria-labelledby"?: string;
  /** The system is still answering (e.g. asking for a permission): pulses and ignores taps. */
  busy?: boolean;
  disabled?: boolean;
};

/**
 * An on/off switch for something that takes effect at once. The knob slides; on is green. Put it in a row with
 * `<Row title="Notifications" accessory={<Toggle … />} />`.
 */
export function Toggle({ isOn, onChange, label, busy = false, disabled = false, ...aria }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      onClick={() => onChange(!isOn)}
      className={cx("st-toggle", isOn && "st-toggle--on", busy && "st-toggle--busy")}
      {...aria}
    >
      <span className="st-toggle__track" aria-hidden>
        <span className="st-toggle__knob" />
      </span>
    </button>
  );
}
