import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cx } from "./cx";

type Alinhamento = "leading" | "center" | "trailing" | "stretch";
const PARA_CSS: Record<Alinhamento, CSSProperties["alignItems"]> = {
  leading: "flex-start",
  center: "center",
  trailing: "flex-end",
  stretch: "stretch",
};

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  /** Cross-axis alignment of the children. */
  alignment?: Alinhamento;
  /** Space between children, in px. */
  spacing?: number;
  children?: ReactNode;
};

function Stack({ eixo, alignment, spacing, className, style, ...props }: StackProps & { eixo: "v" | "h" }) {
  return (
    <div
      {...props}
      className={cx("st-stack", eixo === "v" ? "st-vstack" : "st-hstack", className)}
      style={{ alignItems: alignment ? PARA_CSS[alignment] : eixo === "h" ? "center" : undefined, gap: spacing, ...style }}
    />
  );
}

/** Lays children out top to bottom. */
export function VStack(props: StackProps) {
  return <Stack eixo="v" {...props} />;
}

/** Lays children out left to right, vertically centered by default. */
export function HStack(props: StackProps) {
  return <Stack eixo="h" {...props} />;
}

/** Overlays children on top of each other. */
export function ZStack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("st-zstack", className)} />;
}

/** Takes all the free space along the stack's axis. */
export function Spacer() {
  return <div aria-hidden className="st-spacer" />;
}

/** A hairline separator. Horizontal by default; `vertical` inside an HStack. */
export function Divider({ vertical = false }: { vertical?: boolean }) {
  return <hr aria-hidden className={cx("st-divider", vertical ? "st-divider--vertical" : "st-divider--horizontal")} />;
}
