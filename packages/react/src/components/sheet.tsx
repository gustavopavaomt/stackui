import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cx } from "../primitives/cx";

export type SheetProps = {
  /** Shown or hidden. The sheet animates in and out on its own. */
  isPresented: boolean;
  /** Asked to close: the close button, a tap outside, Esc, the Android back gesture or a drag down. */
  onDismiss: () => void;
  title: string;
  /** A short line under the title. */
  description?: ReactNode;
  /** A large symbol above the description (any element). */
  icon?: ReactNode;
  /** Red symbol, for a destructive confirmation. */
  destructive?: boolean;
  /** While true (e.g. saving), nothing closes the sheet. */
  interactiveDismissDisabled?: boolean;
  /** Shows a back button: the sheet has an inner screen behind this one. */
  onBack?: () => void;
  /** Labels for screen readers (translate them). */
  closeLabel?: string;
  backLabel?: string;
  children?: ReactNode;
};

/** Drag down past this, or flick faster than this, and the sheet closes. */
const FECHA_PX = 120;
const FECHA_VELOCIDADE = 0.6; // px/ms
const SAIDA_MS = 320;

type CloseWatcherLike = { onclose: (() => void) | null; destroy: () => void };

/**
 * The bottom sheet: a panel that slides up over everything. Drag the handle or the header down to close (the
 * content keeps its own scroll). Accessible as a modal dialog: Esc and a tap outside close it, the page behind
 * does not scroll, and focus returns to whoever opened it.
 */
export function Sheet({ isPresented, onDismiss, title, description, icon, destructive, interactiveDismissDisabled = false, onBack, closeLabel = "Close", backLabel = "Back", children }: SheetProps) {
  const id = useId();
  const [montada, setMontada] = useState(isPresented);
  const [visivel, setVisivel] = useState(false);
  const [arrasto, setArrasto] = useState(0);
  const arrastando = useRef<{ y: number; t: number; ultimoY: number; ultimoT: number } | null>(null);
  const quemAbriu = useRef<HTMLElement | null>(null);
  // Refs keep the effects tied to open/close only: callers pass new arrow functions on every render.
  const fechar = useRef(onDismiss);
  const travada = useRef(interactiveDismissDisabled);
  useEffect(() => {
    fechar.current = onDismiss;
    travada.current = interactiveDismissDisabled;
  });

  // Mount → next frame, slide in. Close → slide out, then unmount.
  useEffect(() => {
    if (isPresented) {
      setMontada(true);
      const quadro = requestAnimationFrame(() => requestAnimationFrame(() => setVisivel(true)));
      return () => cancelAnimationFrame(quadro);
    }
    setVisivel(false);
    setArrasto(0);
    const t = window.setTimeout(() => setMontada(false), SAIDA_MS);
    return () => window.clearTimeout(t);
  }, [isPresented]);

  useEffect(() => {
    if (!isPresented) return;
    quemAbriu.current = document.activeElement as HTMLElement | null;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !travada.current) fechar.current();
    };
    document.addEventListener("keydown", tecla);
    // Android: the system back gesture closes the sheet, not the screen behind it.
    const Vigia = (window as unknown as { CloseWatcher?: new () => CloseWatcherLike }).CloseWatcher;
    let vigia: CloseWatcherLike | null = null;
    try {
      vigia = Vigia ? new Vigia() : null;
    } catch {
      vigia = null;
    }
    if (vigia) vigia.onclose = () => !travada.current && fechar.current();
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", tecla);
      vigia?.destroy();
      quemAbriu.current?.focus({ preventScroll: true });
    };
  }, [isPresented]);

  const comecar = (e: PointerEvent<HTMLDivElement>) => {
    if (travada.current || (e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastando.current = { y: e.clientY, t: e.timeStamp, ultimoY: e.clientY, ultimoT: e.timeStamp };
  };
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrastando.current;
    if (!a) return;
    const dy = e.clientY - a.y;
    a.ultimoY = e.clientY;
    a.ultimoT = e.timeStamp;
    // Down follows the finger; up resists (a rubber band).
    setArrasto(dy > 0 ? dy : dy * 0.05);
  };
  const soltar = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrastando.current;
    arrastando.current = null;
    if (!a) return;
    const dy = e.clientY - a.y;
    const velocidade = (e.clientY - a.ultimoY) / Math.max(1, e.timeStamp - a.ultimoT);
    if (dy > FECHA_PX || (dy > 10 && velocidade > FECHA_VELOCIDADE)) fechar.current();
    else setArrasto(0);
  };

  if (!montada) return null;
  return createPortal(
    <div className={cx("st-sheet-backdrop", visivel && "st-sheet-backdrop--visible")} onClick={() => !interactiveDismissDisabled && onDismiss()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.stopPropagation()}
        className={cx("st-sheet", visivel && "st-sheet--visible", arrasto !== 0 && arrastando.current && "st-sheet--dragging")}
        style={arrasto ? ({ "--st-sheet-drag": `${arrasto}px` } as CSSProperties) : undefined}
      >
        {/* The handle and the header are the drag grip. */}
        <div className="st-sheet__grip" onPointerDown={comecar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}>
          <span className="st-sheet__handle" aria-hidden />
          <div className="st-sheet__header">
            {onBack ? (
              <button type="button" onClick={onBack} disabled={interactiveDismissDisabled} aria-label={backLabel} className="st-glass-button">
                <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
            ) : (
              <span />
            )}
            <h2 id={`${id}-title`} className="st-sheet__title">
              {title}
            </h2>
            <button type="button" onClick={onDismiss} disabled={interactiveDismissDisabled} aria-label={closeLabel} className="st-glass-button">
              <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {(description || icon) && (
            <div className="st-sheet__intro">
              {icon && <span className={cx("st-sheet__icon", destructive && "st-sheet__icon--destructive")}>{icon}</span>}
              {description && <p className="st-sheet__description">{description}</p>}
            </div>
          )}
        </div>
        <div className="st-sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
