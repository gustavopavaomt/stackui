import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Up to this many items the list draws everything: a window for 5 items only complicates. */
const ATE_SEM_JANELA = 30;
/** Extra cells above and below the screen: a fast scroll never sees the blank coming. */
const SOBRA = 6;

export type LazyListProps<T> = {
  items: T[];
  /** A stable key per item. */
  id: (item: T) => string;
  /** Likely height of a row in px, until the first measure. */
  estimatedRowHeight: number;
  /** Draws a row (usually a `Row` with `lineLimit={1}`: every row gets the height of the tallest of the first ones). */
  render: (item: T) => ReactNode;
  /** The scrolling box, when the list is not in the page scroll (e.g. inside a sheet). */
  scrollContainer?: () => HTMLElement | null;
};

/**
 * A long list that stays smooth with tens of thousands of rows, the way native lists do: only what is on screen
 * exists, every row has the same height (measured once), and cells are recycled (the one leaving at the top comes
 * back at the bottom with other content). Short lists draw everything.
 */
export function LazyList<T>(props: LazyListProps<T>) {
  if (props.items.length <= ATE_SEM_JANELA || typeof ResizeObserver === "undefined") {
    return (
      <ul className="st-section__card st-lazy-list">
        {props.items.map((item, i) => (
          <li key={props.id(item)} data-index={i} className="st-lazy-list__cell">
            {props.render(item)}
          </li>
        ))}
      </ul>
    );
  }
  return <Janela {...props} />;
}

function Janela<T>({ items, estimatedRowHeight, render, scrollContainer }: LazyListProps<T>) {
  const lista = useRef<HTMLUListElement>(null);
  const [altura, setAltura] = useState(estimatedRowHeight);
  const [faixa, setFaixa] = useState({ de: 0, ate: Math.min(items.length, 2 * SOBRA + 12) });
  const total = items.length;

  // The visible range, computed at most once per frame and stored only when it changes row.
  useLayoutEffect(() => {
    const ul = lista.current;
    if (!ul) return;
    const caixa = scrollContainer?.() ?? null;
    // offsetTop, not getBoundingClientRect: a screen transition is a transform and would shift the measure.
    const topo = () => {
      if (caixa) return ul.getBoundingClientRect().top - caixa.getBoundingClientRect().top + caixa.scrollTop;
      let t = 0;
      for (let el: HTMLElement | null = ul; el; el = el.offsetParent as HTMLElement | null) t += el.offsetTop;
      return t;
    };
    const calcular = () => {
      const rolado = (caixa ? caixa.scrollTop : window.scrollY) - topo();
      const tela = caixa ? caixa.clientHeight : window.innerHeight;
      const slots = Math.ceil(tela / altura) + 2 * SOBRA;
      const de = Math.min(Math.max(0, Math.floor(rolado / altura) - SOBRA), Math.max(0, total - slots));
      const ate = Math.min(total, de + slots);
      setFaixa((f) => (f.de === de && f.ate === ate ? f : { de, ate }));
    };
    let quadro = 0;
    const aoRolar = () => {
      if (!quadro)
        quadro = requestAnimationFrame(() => {
          quadro = 0;
          calcular();
        });
    };
    calcular();
    const alvo: HTMLElement | Window = caixa ?? window;
    alvo.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    const ro = new ResizeObserver(aoRolar);
    ro.observe(caixa ?? document.body);
    return () => {
      cancelAnimationFrame(quadro);
      alvo.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      ro.disconnect();
    };
  }, [altura, total, scrollContainer]);

  // The real height: the tallest of the first rows drawn (measured again once the screen settles, fonts loaded).
  useLayoutEffect(() => {
    const medir = () => {
      const conteudos = lista.current?.querySelectorAll<HTMLElement>(":scope > li > *");
      let maior = 0;
      conteudos?.forEach((el) => (maior = Math.max(maior, el.getBoundingClientRect().height)));
      if (maior > 0) setAltura((a) => (Math.abs(a - maior) < 0.5 ? a : maior));
    };
    medir();
    const t = window.setTimeout(medir, 700);
    return () => window.clearTimeout(t);
  }, []);

  const slots = Math.max(1, faixa.ate - faixa.de);
  const celulas: ReactNode[] = new Array(slots);
  for (let i = faixa.de; i < faixa.ate; i++) {
    // In slot order, not index order: React moves no node, it only swaps the content.
    celulas[i % slots] = (
      <li key={i % slots} data-index={i} className="st-lazy-list__cell st-lazy-list__cell--recycled" style={{ height: altura, transform: `translateY(${i * altura}px)` }}>
        {render(items[i])}
      </li>
    );
  }

  return (
    <ul ref={lista} className="st-section__card st-lazy-list st-lazy-list--windowed" style={{ height: total * altura }}>
      {celulas}
    </ul>
  );
}
