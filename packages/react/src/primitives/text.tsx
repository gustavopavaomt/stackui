import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cx } from "./cx";

export type TextStyle = "largeTitle" | "title" | "title2" | "title3" | "headline" | "body" | "callout" | "subheadline" | "footnote" | "caption" | "caption2";
export type TextColor = "primary" | "secondary" | "tertiary" | "tint" | "danger";

/** The HTML element each style renders by default (headings stay headings for screen readers). */
const ELEMENTO: Partial<Record<TextStyle, ElementType>> = { largeTitle: "h1", title: "h1", title2: "h2", title3: "h3" };

export type TextProps = HTMLAttributes<HTMLElement> & {
  /** Platform text style. Default `body`. */
  font?: TextStyle;
  color?: TextColor;
  /** One line with an ellipsis, like a list row title. */
  lineLimit?: 1;
  /** Render as another element (e.g. `span`, `label`). */
  as?: ElementType;
  children?: ReactNode;
};

export function Text({ font = "body", color = "primary", lineLimit, as, className, ...props }: TextProps) {
  const Elemento = as ?? ELEMENTO[font] ?? "p";
  return <Elemento {...props} className={cx("st-text", `st-text--${font}`, color !== "primary" && `st-text--${color}`, lineLimit === 1 && "st-text--lineLimit", className)} />;
}
