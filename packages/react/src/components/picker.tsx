import type { CSSProperties } from "react";

import { cx } from "../primitives/cx";

export type PickerOption<T extends string> = { value: T; label: string };

export type PickerProps<T extends string> = {
  selection: T;
  onChange: (value: T) => void;
  options: PickerOption<T>[];
  /** What is being chosen, for screen readers. */
  label: string;
  disabled?: boolean;
};

/**
 * A segmented picker: 2 to 4 short options that exclude each other. The chosen one sits on a pill that slides
 * from option to option. Accessible as a radio group.
 */
export function Picker<T extends string>({ selection, onChange, options, label, disabled = false }: PickerProps<T>) {
  const indice = Math.max(0, options.findIndex((o) => o.value === selection));
  return (
    <div role="radiogroup" aria-label={label} aria-disabled={disabled || undefined} className={cx("st-segmented", disabled && "st-segmented--disabled")} style={{ "--st-seg-i": indice, "--st-seg-n": options.length } as CSSProperties}>
      <span className="st-segmented__pill" aria-hidden />
      {options.map((o) => {
        const ativo = o.value === selection;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={ativo} disabled={disabled} onClick={() => !ativo && onChange(o.value)} className={cx("st-segmented__option", ativo && "st-segmented__option--selected")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
