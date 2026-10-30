import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cx } from "../primitives/cx";

export type AlertAction = {
  label: string;
  /** `cancel` closes (Esc and a tap outside do the same); `destructive` is red. */
  role?: "cancel" | "destructive";
  onPress?: () => void;
};

export type AlertProps = {
  isPresented: boolean;
  onDismiss: () => void;
  title: string;
  message?: ReactNode;
  /** One or two side by side; three or more stack. Default: a single "OK". */
  actions?: AlertAction[];
  /** Custom content between the message and the buttons (an image, a field). */
  children?: ReactNode;
};

const FOCAVEIS = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const SAIDA_MS = 200;

/**
 * A centered dialog for something the person must read now: a title, a short message and up to a few buttons.
 * Focus stays inside; Esc and a tap outside cancel; focus returns to whoever opened it.
 */
export function Alert({ isPresented, onDismiss, title, message, actions = [{ label: "OK" }], children }: AlertProps) {
  const id = useId();
  const painel = useRef<HTMLDivElement>(null);
  const [montado, setMontado] = useState(isPresented);
  const [visivel, setVisivel] = useState(false);
  const fechar = useRef(onDismiss);
  useEffect(() => {
    fechar.current = onDismiss;
  });

  useEffect(() => {
    if (isPresented) {
      setMontado(true);
      const q = requestAnimationFrame(() => requestAnimationFrame(() => setVisivel(true)));
      return () => cancelAnimationFrame(q);
    }
    setVisivel(false);
    const t = window.setTimeout(() => setMontado(false), SAIDA_MS);
    return () => window.clearTimeout(t);
  }, [isPresented]);

  useEffect(() => {
    if (!isPresented) return;
    const quemTinha = document.activeElement as HTMLElement | null;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focar = requestAnimationFrame(() => painel.current?.querySelector<HTMLElement>("[data-default]")?.focus({ preventScroll: true }));
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") return fechar.current();
      if (e.key !== "Tab" || !painel.current) return;
      const itens = [...painel.current.querySelectorAll<HTMLElement>(FOCAVEIS)];
      if (!itens.length) return e.preventDefault();
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      const dentro = painel.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === primeiro || !dentro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", tecla);
    return () => {
      cancelAnimationFrame(focar);
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", tecla);
      if (quemTinha && quemTinha !== document.body && document.contains(quemTinha)) quemTinha.focus({ preventScroll: true });
    };
  }, [isPresented]);

  if (!montado) return null;
  // The default (focused) button: the first that is not cancel, else the first.
  const padrao = Math.max(0, actions.findIndex((a) => a.role !== "cancel"));
  return createPortal(
    <div className={cx("st-alert-backdrop", visivel && "st-alert-backdrop--visible")} onClick={onDismiss}>
      <div ref={painel} role="alertdialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={message ? `${id}-message` : undefined} onClick={(e) => e.stopPropagation()} className={cx("st-alert", visivel && "st-alert--visible")}>
        <h2 id={`${id}-title`} className="st-alert__title">
          {title}
        </h2>
        {message && (
          <p id={`${id}-message`} className="st-alert__message">
            {message}
          </p>
        )}
        {children}
        <div className={cx("st-alert__actions", actions.length > 2 && "st-alert__actions--stacked")}>
          {actions.map((a, i) => (
            <button
              key={a.label}
              type="button"
              data-default={i === padrao || undefined}
              onClick={() => {
                a.onPress?.();
                onDismiss();
              }}
              className={cx("st-alert__button", a.role === "cancel" && "st-alert__button--cancel", a.role === "destructive" && "st-alert__button--destructive")}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
