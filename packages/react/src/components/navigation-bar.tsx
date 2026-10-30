import { useEffect, useLayoutEffect, useRef, useState, type ElementType, type MouseEvent, type MouseEventHandler, type ReactNode } from "react";

import { cx } from "../primitives/cx";

export type NavigationBarProps = {
  title: string;
  /** A line under the title. */
  subtitle?: ReactNode;
  /** `large` (default): a big title in the content that shrinks into the bar on scroll. `inline`: always small, in the bar. */
  displayMode?: "large" | "inline";
  /** Shows the back button. */
  onBack?: (e: MouseEvent<HTMLElement>) => void;
  /** Back as a link (`href`, or your router's link with `backAs` + `backProps`). */
  backHref?: string;
  backAs?: ElementType;
  backProps?: Record<string, unknown>;
  backLabel?: string;
  /** Toolbar items on the trailing side (e.g. `ToolbarButton`s). */
  trailing?: ReactNode;
  /** On a root screen (no back), shown in place of the large title (a logo, a greeting). */
  largeTitleContent?: ReactNode;
};

/**
 * The navigation bar of a screen. Transparent at rest; when content scrolls under it, it gets the frosted glass and
 * the hairline. With the large title, the small centered title appears once the big one scrolls away.
 */
export function NavigationBar({ title, subtitle, displayMode = "large", onBack, backHref, backAs, backProps, backLabel = "Back", trailing, largeTitleContent }: NavigationBarProps) {
  const grande = displayMode === "large";
  const temVoltar = !!(onBack || backHref || backAs);
  const raiz = grande && !temVoltar;
  const marco = useRef<HTMLSpanElement>(null);
  const barra = useRef<HTMLElement>(null);
  const tituloGrande = useRef<HTMLDivElement>(null);
  const [rolou, setRolou] = useState(false);
  const [compacto, setCompacto] = useState(!grande);
  const [vao, setVao] = useState(0);

  // On a root screen the large title shares the bar row with the toolbar (no empty row just for buttons).
  useLayoutEffect(() => {
    const pai = tituloGrande.current?.parentElement;
    if (raiz && pai) setVao(parseFloat(getComputedStyle(pai).rowGap) || 0);
  }, [raiz]);

  // Scrolled = the bar is stuck and the marker right before it went up past it. Measured on scroll, not with an
  // IntersectionObserver: inside an iframe its default root is the outer page, which got this wrong.
  useEffect(() => {
    const medir = () => {
      const m = marco.current?.getBoundingClientRect();
      const b = barra.current?.getBoundingClientRect();
      if (!m || !b) return;
      setRolou(m.top < b.top - 1);
      if (!grande) return;
      const t = tituloGrande.current?.getBoundingClientRect();
      if (t) setCompacto(raiz ? t.top + t.height / 2 < b.top : t.bottom < b.bottom);
    };
    medir();
    document.addEventListener("scroll", medir, { passive: true, capture: true });
    return () => document.removeEventListener("scroll", medir, { capture: true });
  }, [grande, raiz]);

  const Voltar: ElementType = backAs ?? (backHref ? "a" : "button");
  const TituloBarra = grande ? "span" : "h1";
  return (
    <>
      <span ref={marco} aria-hidden className="st-navbar__sentinel" />
      <header ref={barra} className={cx("st-navbar", rolou && "st-navbar--scrolled")}>
        <div className="st-navbar__leading">
          {temVoltar && (
            <Voltar {...backProps} {...(backHref ? { href: backHref } : {})} {...(Voltar === "button" ? { type: "button" } : {})} onClick={onBack} aria-label={backLabel} className="st-glass-button">
              <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </Voltar>
          )}
        </div>
        <div className={cx("st-navbar__center", compacto && "st-navbar__center--visible")}>
          <TituloBarra aria-hidden={grande || undefined} className="st-navbar__title">
            {title}
          </TituloBarra>
          {!grande && subtitle && <p className="st-navbar__subtitle">{subtitle}</p>}
        </div>
        <div className="st-navbar__trailing">{trailing}</div>
      </header>
      {grande && (
        <div ref={tituloGrande} style={raiz ? { marginTop: -52 - vao } : undefined} className={cx("st-large-title", raiz && "st-large-title--root", raiz && compacto && "st-large-title--hidden")}>
          <h1 className="st-large-title__text">
            {raiz && largeTitleContent ? (
              <>
                <span className="st-visually-hidden">{title}</span>
                {largeTitleContent}
              </>
            ) : (
              title
            )}
          </h1>
          {subtitle && <p className="st-large-title__subtitle">{subtitle}</p>}
        </div>
      )}
    </>
  );
}

export type ToolbarButtonProps = {
  /** Read by screen readers (the button shows only the icon). */
  label: string;
  icon: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Filled with the tint: the main action of the screen (e.g. "+"). */
  prominent?: boolean;
  /** A small dot: "there is something here" (e.g. a filter applied). */
  dot?: boolean;
  disabled?: boolean;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "menu" | "dialog";
};

/** A round toolbar item. */
export function ToolbarButton({ label, icon, onClick, prominent, dot, disabled, ...aria }: ToolbarButtonProps) {
  return (
    <button type="button" aria-label={label} onClick={onClick} disabled={disabled} {...aria} className={cx("st-glass-button", prominent && "st-glass-button--prominent")}>
      {icon}
      {dot && <span className="st-glass-button__dot" aria-hidden />}
    </button>
  );
}

/** A text toolbar item in the tint (e.g. "Save"). */
export function ToolbarTextButton({ children, onClick, disabled, type = "button", form }: { children: ReactNode; onClick?: MouseEventHandler<HTMLButtonElement>; disabled?: boolean; type?: "button" | "submit"; form?: string }) {
  return (
    <button type={type} form={form} onClick={onClick} disabled={disabled} className="st-toolbar-text-button">
      {children}
    </button>
  );
}
