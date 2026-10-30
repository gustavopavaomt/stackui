import { useEffect, useRef, type ReactNode } from "react";

import { Button, type ButtonState } from "./button";
import { Sheet } from "./sheet";

export type ConfirmationItem = { label: string; value: ReactNode };

export type ConfirmationSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  /** What will be saved, as label × value lines (a receipt). */
  items?: ConfirmationItem[];
  confirmLabel: string;
  doneLabel?: ReactNode;
  loadingLabel?: ReactNode;
  /** The bottom button, which only closes. */
  cancelLabel?: string;
  /** idle → loading → done: while not idle, nothing closes the sheet. */
  state?: ButtonState;
  /** Deleting or cancelling: red symbol and button. */
  destructive?: boolean;
  icon?: ReactNode;
  /** Between the lines and the button (e.g. a reason field). */
  children?: ReactNode;
};

const RECIBO = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zm0 9l2 2 4-4" />
  </svg>
);
const ALERTA = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l10 18H2L12 3zm0 7v4m0 3.5h.01" />
  </svg>
);

/**
 * Before saving or cancelling a record, the person checks what will happen and confirms. The main button gives
 * the feedback in place (spinner → check); focus lands on it once the sheet is up.
 */
export function ConfirmationSheet({ isPresented, onDismiss, onConfirm, title, description, items = [], confirmLabel, doneLabel, loadingLabel, cancelLabel = "Go back and review", state = "idle", destructive, icon, children }: ConfirmationSheetProps) {
  const botoes = useRef<HTMLDivElement>(null);
  const travada = state !== "idle";

  useEffect(() => {
    if (!isPresented) return;
    const t = window.setTimeout(() => botoes.current?.querySelector("button")?.focus({ preventScroll: true }), 350);
    return () => window.clearTimeout(t);
  }, [isPresented]);

  return (
    <Sheet isPresented={isPresented} onDismiss={onDismiss} title={title} description={description} icon={icon ?? (destructive ? ALERTA : RECIBO)} destructive={destructive} interactiveDismissDisabled={travada}>
      {items.length > 0 && (
        <dl className="st-section__card st-receipt">
          {items.map((item) => (
            <div key={item.label} className="st-row st-receipt__line">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
      <div ref={botoes} className="st-sheet__actions">
        <Button size="large" variant={destructive && state !== "done" ? "destructive" : "prominent"} state={state} onClick={onConfirm} doneLabel={doneLabel} loadingLabel={loadingLabel}>
          {confirmLabel}
        </Button>
        <Button size="large" variant="plain" onClick={onDismiss} disabled={travada}>
          {cancelLabel}
        </Button>
      </div>
    </Sheet>
  );
}
