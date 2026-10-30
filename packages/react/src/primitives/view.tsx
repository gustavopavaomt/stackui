import type { HTMLAttributes } from "react";

import { cx } from "./cx";

/** The basic building block: a plain container that takes any HTML attributes. */
export function View(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}

/**
 * The app root. Applies the background, text color, font and smoothing, and switches light/dark with the system
 * (or with `<html data-theme>`). Wrap the whole app once.
 */
export function App({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("st-app", className)} />;
}
