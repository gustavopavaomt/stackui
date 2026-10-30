import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cx } from "../primitives/cx";
import { ToolbarButton } from "./navigation-bar";

export type MenuItem = {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
  /** A link instead of an action. */
  href?: string;
  /** Red, like a delete. */
  destructive?: boolean;
};

export type MenuProps = {
  /** What the button does, for screen readers. */
  label: string;
  icon: ReactNode;
  items: MenuItem[];
  /** Filled with the tint (the "+" of a list). With a single item, a prominent button runs it directly. */
  prominent?: boolean;
};

/**
 * A toolbar button that opens a context menu anchored to it: a frosted card, label on the leading side and symbol
 * on the trailing side. Closes on choosing, on a tap outside and with Esc.
 */
export function Menu({ label, icon, items, prominent = false }: MenuProps) {
  const ancora = useRef<HTMLSpanElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const [posicao, setPosicao] = useState<{ top: number; right: number } | null>(null);
  const unico = items.length === 1 && prominent ? items[0] : null;

  useEffect(() => {
    if (!posicao) return;
    lista.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus({ preventScroll: true });
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPosicao(null);
        ancora.current?.querySelector("button")?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const itens = [...(lista.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
        const i = itens.indexOf(document.activeElement as HTMLElement);
        itens[(i + (e.key === "ArrowDown" ? 1 : itens.length - 1)) % itens.length]?.focus();
      }
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [posicao]);

  const abrir = () => {
    const r = ancora.current?.getBoundingClientRect();
    if (r) setPosicao({ top: r.bottom + 8, right: Math.max(8, window.innerWidth - r.right) });
  };
  const executar = (item: MenuItem) => {
    setPosicao(null);
    item.onPress?.();
  };

  if (unico && !unico.href) return <ToolbarButton label={unico.label} icon={icon} prominent onClick={unico.onPress} />;
  return (
    <>
      <span ref={ancora} className="st-menu__anchor">
        <ToolbarButton label={label} icon={icon} prominent={prominent} aria-haspopup="menu" aria-expanded={!!posicao} onClick={() => (posicao ? setPosicao(null) : abrir())} />
      </span>
      {posicao &&
        createPortal(
          <>
            <div className="st-menu__scrim" aria-hidden onClick={() => setPosicao(null)} />
            <ul ref={lista} role="menu" aria-label={label} className="st-menu" style={{ top: posicao.top, right: posicao.right }}>
              {items.map((item) => {
                const conteudo = (
                  <>
                    <span className="st-menu__label">{item.label}</span>
                    {item.icon && (
                      <span className="st-menu__icon" aria-hidden>
                        {item.icon}
                      </span>
                    )}
                  </>
                );
                const classe = cx("st-menu__item st-pressable", item.destructive && "st-menu__item--destructive");
                return (
                  <li key={item.label} role="none" className="st-menu__row">
                    {item.href ? (
                      <a role="menuitem" href={item.href} onClick={() => executar(item)} className={classe}>
                        {conteudo}
                      </a>
                    ) : (
                      <button type="button" role="menuitem" onClick={() => executar(item)} className={classe}>
                        {conteudo}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </>,
          document.body,
        )}
    </>
  );
}
