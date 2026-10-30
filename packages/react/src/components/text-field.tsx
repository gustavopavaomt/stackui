import { useId, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";

import { cx } from "../primitives/cx";

export type TextFieldProps = {
  /** The label: inside the field when empty, floats up on focus or with text. */
  label: string;
  /** An error message under the field (also marks it invalid for screen readers). */
  error?: string;
  /** Something on the trailing side (a unit, a button). */
  accessory?: ReactNode;
  ref?: Ref<HTMLInputElement>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder">;

/** A text field cell for a `Section`, with the floating label. */
export function TextField({ label, error, accessory, id, className, ref, ...rest }: TextFieldProps) {
  const gerado = useId();
  const campo = id ?? gerado;
  return (
    <div className={cx("st-row st-field", error && "st-field--invalid", className)}>
      <div className="st-field__box">
        <input ref={ref} id={campo} placeholder=" " aria-invalid={!!error || undefined} aria-describedby={error ? `${campo}-error` : undefined} className="st-field__input" {...rest} />
        <label htmlFor={campo} className="st-field__label">
          {label}
        </label>
        {error && (
          <span id={`${campo}-error`} className="st-field__error">
            {error}
          </span>
        )}
      </div>
      {accessory}
    </div>
  );
}

export type TextEditorProps = {
  /** Shown as the placeholder and read by screen readers. */
  label: string;
  rows?: number;
  ref?: Ref<HTMLTextAreaElement>;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "placeholder">;

/** Free text (a note) in a tall cell. */
export function TextEditor({ label, rows = 3, id, className, ref, ...rest }: TextEditorProps) {
  const gerado = useId();
  const campo = id ?? gerado;
  return (
    <div className={cx("st-row st-text-editor", className)}>
      <label htmlFor={campo} className="st-visually-hidden">
        {label}
      </label>
      <textarea ref={ref} id={campo} rows={rows} placeholder={label} className="st-text-editor__input" {...rest} />
    </div>
  );
}
