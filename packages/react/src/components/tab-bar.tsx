import { useLayoutEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

import { cx } from "../primitives/cx";

export type TabItem = {
  id: string;
  label: string;
  icon: ReactNode;
  /** The icon when selected (e.g. the filled version). */
  selectedIcon?: ReactNode;
  /** A red count on the icon. */
  badge?: number;
  /** Navigate with a link (`href`, or your router's link with `as` + `props`). */
  href?: string;
  as?: ElementType;
  props?: Record<string, unknown>;
};

export type TabBarProps = {
  items: TabItem[];
  selection: string;
  /** Called on tap (also with `href`/`as`, after the link's own navigation). */
  onSelect?: (id: string) => void;
  /** Slides the bar out of the screen (on a child screen), keeping it mounted. */
  hidden?: boolean;
  label?: string;
};

/**
 * The bottom tab bar: a floating capsule; the selected tab is a pill with its icon and name that slides from tab to
 * tab. The others show only the icon (the name stays for screen readers).
 */
export function TabBar({ items, selection, onSelect, hidden = false, label = "Main" }: TabBarProps) {
  const lista = useRef<HTMLUListElement>(null);
  const [pilula, setPilula] = useState<{ x: number; w: number } | null>(null);

  // The pill follows the selected tab (measured after layout; the CSS transition makes it slide).
  useLayoutEffect(() => {
    const medir = () => {
      // The <li> (its offsetParent is the list); the link's own offsetParent is the item.
      const alvo = lista.current?.querySelector<HTMLElement>("[aria-current=page]")?.closest("li");
      if (alvo) setPilula({ x: alvo.offsetLeft, w: alvo.offsetWidth });
    };
    medir();
    // Late web fonts and the label of the new tab change the widths.
    const o = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(medir);
    if (o && lista.current) o.observe(lista.current);
    window.addEventListener("resize", medir);
    return () => {
      o?.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [selection, items]);

  return (
    <nav aria-label={label} inert={hidden || undefined} className={cx("st-tabbar", hidden && "st-tabbar--hidden")}>
      <ul ref={lista} className="st-tabbar__list">
        {pilula && <li aria-hidden className="st-tabbar__pill" style={{ "--st-pill-x": `${pilula.x}px`, "--st-pill-w": `${pilula.w}px` } as CSSProperties} />}
        {items.map((item) => {
          const aceso = item.id === selection;
          const Elemento: ElementType = item.as ?? (item.href ? "a" : "button");
          return (
            <li key={item.id} className={cx("st-tabbar__item", aceso && "st-tabbar__item--selected")}>
              <Elemento
                {...item.props}
                {...(item.href ? { href: item.href } : {})}
                {...(Elemento === "button" ? { type: "button" } : {})}
                aria-current={aceso ? "page" : undefined}
                onClick={() => onSelect?.(item.id)}
                className="st-tabbar__link"
              >
                <span className="st-tabbar__icon">
                  {aceso ? (item.selectedIcon ?? item.icon) : item.icon}
                  {item.badge ? <span className="st-tabbar__badge">{item.badge > 99 ? "99+" : item.badge}</span> : null}
                </span>
                <span className={aceso ? "st-tabbar__label" : "st-visually-hidden"}>{item.label}</span>
              </Elemento>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
