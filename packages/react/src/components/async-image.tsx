import { useState, type CSSProperties, type ReactNode } from "react";

import { cx } from "../primitives/cx";
import { ProgressView } from "./progress-view";

type Estado = "loading" | "ready" | "failed";

/** Addresses already loaded in this session: they are born ready (no placeholder every time a row comes back). */
const jaChegaram = new Set<string>();

export type AsyncImageProps = {
  src?: string;
  /** Describe the image; "" when it is decorative (a thumbnail next to its name). */
  alt: string;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  /** e.g. "16 / 9" for a hero, "1" for a thumbnail. */
  aspectRatio?: CSSProperties["aspectRatio"];
  radius?: CSSProperties["borderRadius"];
  /** `contain` (a product photo) or `cover` (a picture that fills). */
  fit?: "contain" | "cover";
  /** Shown when there is no image or it fails (e.g. a package symbol). */
  fallback?: ReactNode;
  /** A spinner over the shimmer while loading (for big images). */
  showProgress?: boolean;
  /** Needed for a service worker to cache images from another domain. */
  crossOrigin?: "anonymous" | "use-credentials";
};

/**
 * An image that loads without leaving a blank: a shimmering placeholder while it comes, a fade when it arrives,
 * and a fallback when it does not (no signal, broken address). The layout never jumps.
 */
export function AsyncImage({ src, alt, width, height, aspectRatio, radius = 10, fit = "contain", fallback, showProgress = false, crossOrigin }: AsyncImageProps) {
  const inicial = (): Estado => (!src ? "failed" : jaChegaram.has(src) ? "ready" : "loading");
  const [estado, setEstado] = useState<Estado>(inicial);
  const [deCache, setDeCache] = useState(estado === "ready");
  // The address changed (a recycled list cell now shows another item): start over, derived during render.
  const [doEndereco, setDoEndereco] = useState(src);
  if (doEndereco !== src) {
    const novo = inicial();
    setDoEndereco(src);
    setEstado(novo);
    setDeCache(novo === "ready");
  }
  const semImagem = !src || estado === "failed";
  return (
    <span className={cx("st-async-image", estado === "loading" && "st-skeleton", semImagem && "st-async-image--failed")} style={{ width, height, aspectRatio, borderRadius: radius }}>
      {semImagem ? (
        fallback
      ) : (
        <>
          {estado === "loading" && showProgress && <ProgressView />}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            crossOrigin={crossOrigin}
            onLoad={() => {
              if (src) jaChegaram.add(src);
              setEstado("ready");
            }}
            onError={() => setEstado("failed")}
            className={cx("st-async-image__img", !deCache && "st-async-image__img--fade", estado === "ready" && "st-async-image__img--ready")}
            style={{ objectFit: fit }}
          />
        </>
      )}
    </span>
  );
}
