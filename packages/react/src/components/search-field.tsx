import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

import { cx } from "../primitives/cx";

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** What is searched, for screen readers. */
  label: string;
  placeholder?: string;
  clearLabel?: string;
  /** Pinned under the navigation bar while the page scrolls; hides going down and comes back going up. */
  sticky?: boolean;
  /** A button beside the field (e.g. a barcode scanner). */
  accessory?: ReactNode;
};

/** The search capsule with the magnifier and the clear button. */
export function SearchField({ value, onChange, label, placeholder = "Search", clearLabel = "Clear search", sticky = false, accessory }: SearchFieldProps) {
  const caixa = useRef<HTMLDivElement>(null);
  const escondida = useHideOnScrollDown(caixa, sticky && !value);
  return (
    <div ref={caixa} className={cx("st-search", sticky && "st-search--sticky", escondida && "st-search--hidden")}>
      <label className="st-search__field">
        <span className="st-visually-hidden">{label}</span>
        <svg className="st-search__icon" viewBox="0 0 24 24" width={19} height={19} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M20 20l-4.8-4.8" />
        </svg>
        <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" enterKeyHint="search" className="st-search__input" />
        {value && (
          <button type="button" onClick={() => onChange("")} aria-label={clearLabel} className="st-search__clear">
            <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path d="M9 9l6 6M15 9l-6 6" stroke="var(--st-surface)" strokeWidth={2.25} strokeLinecap="round" />
            </svg>
          </button>
        )}
      </label>
      {accessory}
    </div>
  );
}

/** Less than this is a trembling finger, not a scroll. */
const LIMIAR_PX = 6;
/** Near the top the field always shows. */
const PERTO_DO_ALTO_PX = 60;

function useHideOnScrollDown(caixa: RefObject<HTMLDivElement | null>, ativo: boolean) {
  const [escondida, setEscondida] = useState(false);
  useEffect(() => {
    if (!ativo) return;
    let ultimo = window.scrollY;
    const aoRolar = () => {
      const y = window.scrollY;
      // The iPhone rubber band (at the top and the end) is not a real scroll.
      if (y < 0 || y > document.documentElement.scrollHeight - window.innerHeight) return;
      const d = y - ultimo;
      if (Math.abs(d) < LIMIAR_PX) return;
      ultimo = y;
      const comFoco = !!caixa.current?.contains(document.activeElement);
      setEscondida(!(y <= PERTO_DO_ALTO_PX || d < 0 || comFoco));
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [caixa, ativo]);
  return ativo && escondida;
}

/** For filtering: ignores accents and case ("São" matches "sao"). */
export const normalizeSearch = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
