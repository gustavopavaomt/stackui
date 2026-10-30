import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cx } from "../primitives/cx";

export type CardProps = {
  children?: ReactNode;
  /** Makes the whole card a link (`href`, or your router's link with `as`). */
  href?: string;
  as?: ElementType;
  onClick?: () => void;
} & Omit<ComponentPropsWithoutRef<"div">, "onClick">;

/** A rounded surface. With `href`, `as` or `onClick` the whole card is tappable (it scales a little on touch). */
export function Card({ children, href, as, onClick, className, ...rest }: CardProps) {
  const Elemento: ElementType = as ?? (href ? "a" : onClick ? "button" : "div");
  const tocavel = Elemento !== "div";
  return (
    <Elemento {...rest} {...(href ? { href } : {})} {...(Elemento === "button" ? { type: "button" } : {})} onClick={onClick} className={cx("st-card", tocavel && "st-card--interactive", className)}>
      {children}
    </Elemento>
  );
}
