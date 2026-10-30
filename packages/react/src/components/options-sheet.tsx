import type { ReactNode } from "react";

import { cx } from "../primitives/cx";
import { Sheet } from "./sheet";

export type Option<T extends string> = { value: T; label: string; description?: string; icon?: ReactNode };

export type OptionsListProps<T extends string> = {
  /** What is being chosen, for screen readers. */
  label: string;
  options: Option<T>[];
  selection: T | "";
  onChange: (value: T) => void;
};

const CHECK = (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/** A list with a single selection: a check in the tint beside the chosen one. */
export function OptionsList<T extends string>({ label, options, selection, onChange }: OptionsListProps<T>) {
  return (
    <ul role="listbox" aria-label={label} className="st-section__card st-options">
      {options.map((o) => {
        const escolhida = o.value === selection;
        return (
          <li key={o.value} role="none" className={cx("st-row st-options__item", !!o.icon && "st-row--icon")}>
            <button type="button" role="option" aria-selected={escolhida} onClick={() => onChange(o.value)} className="st-options__button st-pressable">
              {o.icon && (
                <span className="st-options__icon" aria-hidden>
                  {o.icon}
                </span>
              )}
              <span className="st-row__text">
                <span className="st-row__title st-truncate">{o.label}</span>
                {o.description && <span className="st-row__subtitle st-truncate">{o.description}</span>}
              </span>
              <span className="st-options__check" aria-hidden>
                {escolhida && CHECK}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export type OptionsSheetProps<T extends string> = {
  isPresented: boolean;
  onDismiss: () => void;
  title: string;
  options: Option<T>[];
  selection: T | "";
  onChange: (value: T) => void;
  /** The sentence when there is no option. */
  emptyText?: string;
};

/** A choice (a filter, a sort) in a sheet. Choosing closes it. Open it from a `ToolbarButton` (with `dot` while a filter is on). */
export function OptionsSheet<T extends string>({ isPresented, onDismiss, title, options, selection, onChange, emptyText }: OptionsSheetProps<T>) {
  return (
    <Sheet isPresented={isPresented} onDismiss={onDismiss} title={title}>
      {!options.length && emptyText && <p className="st-sheet__empty">{emptyText}</p>}
      {options.length > 0 && (
        <OptionsList
          label={title}
          options={options}
          selection={selection}
          onChange={(v) => {
            onChange(v);
            onDismiss();
          }}
        />
      )}
    </Sheet>
  );
}
