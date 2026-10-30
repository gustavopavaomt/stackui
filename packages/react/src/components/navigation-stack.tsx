import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cx } from "../primitives/cx";

export type StackTransition = "push" | "pop" | "tab" | "none";

export type NavigationStackProps = {
  /** The current location (usually the pathname). Changing it animates to the new screen. */
  location: string;
  /** Draws the screen of a location. The leaving screen keeps being drawn with its own location while it animates
   *  out, so pass it to your router: `render={(l) => <Routes location={l}>…</Routes>}`. */
  render: (location: string) => ReactNode;
  /** How to animate. Default: by depth (more path segments = push, fewer = pop, same = tab). */
  transitionFor?: (from: string, to: string) => StackTransition;
};

const DURACAO: Record<StackTransition, number> = { push: 320, pop: 320, tab: 200, none: 0 };

export const profundidade = (caminho: string) => caminho.split(/[?#]/)[0].split("/").filter(Boolean).length;

export function transitionByDepth(from: string, to: string): StackTransition {
  const a = profundidade(from);
  const b = profundidade(to);
  return b > a ? "push" : b < a ? "pop" : "tab";
}

/** Scroll position per location: opening a screen starts at the top; going back returns to where it was. */
const rolagem = new Map<string, number>();

type Tela = { location: string; papel: "enter" | "exit" | "rest"; transicao: StackTransition; topo: number };

/**
 * Animated screens, like a native navigation stack: pushing slides the new screen in from the trailing edge while
 * the old one recedes; popping does the reverse; switching tabs crossfades. Router agnostic. Respects
 * prefers-reduced-motion (CSS).
 */
export function NavigationStack({ location, render, transitionFor = transitionByDepth }: NavigationStackProps) {
  const [telas, setTelas] = useState<Tela[]>([{ location, papel: "rest", transicao: "none", topo: 0 }]);
  const alvoRolagem = useRef<number | null>(null);
  const atual = telas[telas.length - 1];

  // Derived during render: the location changed → the current screen leaves, the new one enters.
  if (atual.location !== location) {
    const transicao = transitionFor(atual.location, location);
    const saida = typeof window === "undefined" ? 0 : window.scrollY;
    rolagem.set(atual.location, saida);
    const alvo = transicao === "pop" ? (rolagem.get(location) ?? 0) : 0;
    alvoRolagem.current = alvo;
    setTelas([
      // The leaving screen is pinned over its place; `topo` keeps it from jumping when the window scrolls.
      { ...atual, papel: "exit", transicao, topo: alvo - saida },
      { location, papel: "enter", transicao, topo: 0 },
    ]);
  }

  // Before paint: the window is already at the right place when the new screen comes in.
  useLayoutEffect(() => {
    if (alvoRolagem.current === null) return;
    window.scrollTo(0, alvoRolagem.current);
    alvoRolagem.current = null;
  }, [location]);

  useEffect(() => {
    const entrando = telas[telas.length - 1];
    if (entrando.papel !== "enter") return;
    const t = window.setTimeout(() => setTelas([{ ...entrando, papel: "rest", transicao: "none", topo: 0 }]), DURACAO[entrando.transicao] + 30);
    return () => window.clearTimeout(t);
  }, [telas]);

  return (
    <div className="st-navstack">
      {telas.map((t) => (
        <div
          key={t.location}
          aria-hidden={t.papel === "exit" || undefined}
          inert={t.papel === "exit" || undefined}
          className={cx("st-navstack__screen", t.papel !== "rest" && `st-navstack__screen--${t.papel}-${t.transicao}`, t.papel === "exit" && "st-navstack__screen--leaving")}
          style={t.papel === "exit" ? ({ top: t.topo } as CSSProperties) : undefined}
        >
          {render(t.location)}
        </div>
      ))}
    </div>
  );
}
