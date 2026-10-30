export type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  /** What is being counted, for screen readers. */
  label: string;
  min?: number;
  max?: number;
  step?: number;
  decrementLabel?: string;
  incrementLabel?: string;
};

const sinal = (d: string) => (
  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d={d} />
  </svg>
);

/** Minus, the number (typeable, accepts a comma as the decimal sign) and plus. */
export function Stepper({ value, onChange, label, min = 0, max = Infinity, step = 1, decrementLabel = "Decrease", incrementLabel = "Increase" }: StepperProps) {
  const limitar = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div role="group" aria-label={label} className="st-stepper">
      <button type="button" aria-label={decrementLabel} disabled={value <= min} onClick={() => onChange(limitar(value - step))} className="st-stepper__button">
        {sinal("M5 12h14")}
      </button>
      <input
        inputMode="decimal"
        aria-label={label}
        value={String(value)}
        onChange={(e) => {
          // Erasing to type a new number is not 0 (in an order it would remove the item).
          if (!e.target.value.trim()) return;
          const n = Number(e.target.value.replace(",", "."));
          if (!Number.isNaN(n)) onChange(limitar(n));
        }}
        onFocus={(e) => e.currentTarget.select()}
        className="st-stepper__value"
      />
      <button type="button" aria-label={incrementLabel} disabled={value >= max} onClick={() => onChange(limitar(value + step))} className="st-stepper__button">
        {sinal("M12 5v14M5 12h14")}
      </button>
    </div>
  );
}
