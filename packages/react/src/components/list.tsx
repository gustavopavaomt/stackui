import type { CSSProperties, ElementType, HTMLAttributes, MouseEventHandler, ReactNode } from "react";

import { cx } from "../primitives/cx";

/** A scrolling group of sections, like the settings screen of the phone. */
export function List({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("st-list", className)} />;
}

export type SectionProps = {
  /** Small caps title above the card. */
  header?: ReactNode;
  /** Something next to the header (e.g. a "See all" link). */
  headerAccessory?: ReactNode;
  /** Supporting text under the card. */
  footer?: ReactNode;
  /** The children already draw their own card (e.g. a virtualized list). */
  plain?: boolean;
  className?: string;
  id?: string;
  children: ReactNode;
};

/** A titled card of rows. */
export function Section({ header, headerAccessory, footer, plain, className, id, children }: SectionProps) {
  const tituloId = header && id ? `${id}-header` : undefined;
  return (
    <section id={id} aria-labelledby={tituloId} className={cx("st-section", className)}>
      {(header || headerAccessory) && (
        <div className="st-section__header">
          {header && (
            <h2 id={tituloId} className="st-section__title">
              {header}
            </h2>
          )}
          {headerAccessory}
        </div>
      )}
      {plain ? children : <div className="st-section__card">{children}</div>}
      {footer && <div className="st-section__footer">{footer}</div>}
    </section>
  );
}

/** The colored rounded square with a white symbol (the settings icons). */
export function AppIcon({ icon, color = "var(--st-tint)", size = 30, className }: { icon: ReactNode; color?: string; size?: number; className?: string }) {
  return (
    <span aria-hidden className={cx("st-app-icon", className)} style={{ width: size, height: size, borderRadius: size * 0.27, background: color, "--st-app-icon-glyph": `${size * 0.62}px` } as CSSProperties}>
      {icon}
    </span>
  );
}

function Chevron() {
  return (
    <svg className="st-row__chevron" viewBox="0 0 24 24" width={18} height={18} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export type RowProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Gray text on the trailing side (a setting's current value). */
  value?: ReactNode;
  /** Anything on the trailing side instead of the value (a toggle, a badge). */
  accessory?: ReactNode;
  /** An icon inside a colored square (see `AppIcon`). */
  icon?: ReactNode;
  iconColor?: string;
  /** Anything on the leading side instead of the icon (an avatar, a thumbnail). */
  leading?: ReactNode;
  /** Shows the disclosure chevron. Default: when the row navigates (`href` or `as`). */
  chevron?: boolean;
  /** Navigates with a plain link... */
  href?: string;
  /** ...or with your router's link component, e.g. `as={Link} to="/settings"`. */
  as?: ElementType;
  onClick?: MouseEventHandler<HTMLElement>;
  /** A red action (Delete). */
  destructive?: boolean;
  /** A centered action in the tint color (Sign out, Add). */
  centered?: boolean;
  /** Title and subtitle in one line each, with an ellipsis: every row the same height in long lists. */
  lineLimit?: 1;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  /** Extra props for the `as` component (e.g. `to`). */
  [prop: string]: unknown;
};

/** A list cell: optional icon, title, subtitle, value or accessory, and the chevron when it navigates. */
export function Row({ title, subtitle, value, accessory, icon, iconColor, leading, chevron, href, as, onClick, destructive, centered, lineLimit, disabled, className, ...rest }: RowProps) {
  const navega = !!(href || as);
  const interativa = navega || !!onClick;
  const conteudo = (
    <>
      {leading}
      {icon && <AppIcon icon={icon} color={iconColor} />}
      <span className={cx("st-row__text", centered && "st-row__text--centered")}>
        <span className={cx("st-row__title", destructive && "st-row__title--destructive", centered && !destructive && "st-row__title--tint", lineLimit === 1 && "st-truncate")}>{title}</span>
        {subtitle && <span className={cx("st-row__subtitle", lineLimit === 1 && "st-truncate")}>{subtitle}</span>}
      </span>
      {value !== undefined && value !== null && value !== "" && <span className="st-row__value">{value}</span>}
      {accessory}
      {(chevron ?? navega) && <Chevron />}
    </>
  );
  const classe = cx("st-row", !!icon && "st-row--icon", !!leading && "st-row--leading", interativa && "st-pressable", disabled && "st-row--disabled", className);
  if (as) {
    const Elemento = as;
    return (
      <Elemento {...rest} href={href} onClick={onClick} className={classe}>
        {conteudo}
      </Elemento>
    );
  }
  if (href)
    return (
      <a {...(rest as HTMLAttributes<HTMLAnchorElement>)} href={href} onClick={onClick} className={classe}>
        {conteudo}
      </a>
    );
  if (onClick)
    return (
      <button {...(rest as HTMLAttributes<HTMLButtonElement>)} type="button" onClick={onClick} disabled={disabled} className={classe}>
        {conteudo}
      </button>
    );
  return (
    <div {...(rest as HTMLAttributes<HTMLDivElement>)} className={classe}>
      {conteudo}
    </div>
  );
}
