import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { cx } from "../primitives/cx";

export type ToastKind = "success" | "error" | "info" | "progress";
export type ToastAction = { label: string; onPress: () => void };
/** Returned by `show`: change the toast in place (e.g. "Sending…" → "Sent") or take it away. */
export type ToastHandle = { update: (text: string, kind?: ToastKind, action?: ToastAction) => void; dismiss: () => void };

type Toast = { id: number; text: string; kind: ToastKind; action?: ToastAction };

/** How long each kind stays; `progress` stays until updated. Errors stay longer, to read and tap. */
const DURACAO_MS: Record<ToastKind, number | null> = { success: 4000, info: 4500, error: 7000, progress: null };
/** How long the current one stays when others are waiting. */
const COM_FILA_MS: Record<ToastKind, number | null> = { success: 2500, info: 3000, error: 5000, progress: null };
/** Nobody leaves before this, even with a queue (time to read). */
const MINIMO_MS = 1500;
/** Between two toasts: the exit animation plus a breath, so two never share the screen. */
const INTERVALO_MS = 600;
const SAIDA_MS = 300;

/** The queue, outside React: `paint` shows the current toast (or none). One at a time; the same toast twice is ignored. */
export function createToastQueue(paint: (t: Toast | null) => void) {
  let atual: Toast | null = null;
  const fila: Toast[] = [];
  let proximo = 1;
  let relogio = 0;
  let entrada = 0;
  let desde = 0;

  const agendar = () => {
    window.clearTimeout(relogio);
    if (!atual) return;
    const base = DURACAO_MS[atual.kind];
    if (base == null) return;
    const alvo = fila.length ? Math.min(base, COM_FILA_MS[atual.kind] ?? base) : base;
    const id = atual.id;
    relogio = window.setTimeout(() => sair(id), Math.max(MINIMO_MS, alvo - (Date.now() - desde)));
  };

  const mostrar = (t: Toast) => {
    atual = t;
    desde = Date.now();
    paint(t);
    agendar();
  };

  const sair = (id: number) => {
    if (atual?.id !== id) return;
    window.clearTimeout(relogio);
    atual = null;
    paint(null);
    window.clearTimeout(entrada);
    entrada = window.setTimeout(() => {
      const seguinte = fila.shift();
      if (!atual && seguinte) mostrar(seguinte);
    }, INTERVALO_MS);
  };

  const update = (id: number, text: string, kind: ToastKind, action?: ToastAction) => {
    if (atual?.id === id) return mostrar({ id, text, kind, action });
    const n = fila.findIndex((t) => t.id === id);
    if (n >= 0) fila[n] = { id, text, kind, action };
  };

  const dismiss = (id: number) => {
    if (atual?.id === id) return sair(id);
    const n = fila.findIndex((t) => t.id === id);
    if (n >= 0) fila.splice(n, 1);
  };

  const show = (text: string, kind: ToastKind = "success", action?: ToastAction): ToastHandle => {
    const igual = (t: Toast | null) => !!t && t.text === text && t.kind === kind;
    const repetido = igual(atual) ? atual : fila.find(igual);
    const id = repetido ? repetido.id : proximo++;
    if (!repetido) {
      if (!atual && !fila.length) mostrar({ id, text, kind, action });
      else {
        fila.push({ id, text, kind, action });
        agendar();
      }
    }
    return { update: (t, k = "success", a) => update(id, t, k, a), dismiss: () => dismiss(id) };
  };

  return { show, dismiss };
}

type Contexto = { show: (text: string, kind?: ToastKind, action?: ToastAction) => ToastHandle };
const Ctx = createContext<Contexto | null>(null);

/**
 * Short messages at the bottom of the screen: a capsule that rises, says one thing and leaves. Wrap the app once;
 * call `useToast().show(…)` anywhere. Toasts queue (one waits for the other to leave). Move it above your own
 * bottom bar with the `--st-toast-bottom` variable.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [visto, setVisto] = useState<{ toast: Toast; saindo: boolean } | null>(null);
  const saida = useRef(0);
  const [fila] = useState(() =>
    createToastQueue((t) => {
      window.clearTimeout(saida.current);
      if (t) return setVisto({ toast: t, saindo: false });
      setVisto((v) => (v ? { ...v, saindo: true } : v));
      saida.current = window.setTimeout(() => setVisto(null), SAIDA_MS);
    }),
  );
  useEffect(() => () => window.clearTimeout(saida.current), []);
  const valor = useMemo(() => ({ show: fila.show }), [fila]);
  const t = visto?.toast;

  return (
    <Ctx.Provider value={valor}>
      {children}
      <div className="st-toast-region">
        {t && (
          <div key={t.id} role={t.kind === "error" ? "alert" : "status"} className={cx("st-toast", visto.saindo && "st-toast--leaving")}>
            <span className={`st-toast__icon st-toast__icon--${t.kind}`}>
              <ToastIcon kind={t.kind} />
            </span>
            <span key={`${t.kind}:${t.text}`} className="st-toast__text">
              {t.text}
            </span>
            {t.action && (
              <button
                type="button"
                className="st-toast__action"
                onClick={() => {
                  t.action!.onPress();
                  fila.dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

function ToastIcon({ kind }: { kind: ToastKind }) {
  if (kind === "progress")
    return (
      <span className="st-toast__dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    );
  const d = {
    success: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm-4-10.5l3 3 5-6",
    error: "M12 3l10 18H2L12 3zm0 7v4m0 3.5h.01",
    info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-11v6m0-9.5h.01",
  }[kind];
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast must be used inside <ToastProvider>");
  return c;
}
