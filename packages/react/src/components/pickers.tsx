import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { cx } from "../primitives/cx";
import { OptionsList, type Option } from "./options-sheet";
import { SearchField, normalizeSearch } from "./search-field";
import { Sheet } from "./sheet";

const SETA = (
  <svg className="st-row__chevron" viewBox="0 0 24 24" width={18} height={18} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

/** The cell that shows the current choice and opens a picker: label, the choice in gray, the chevron. */
export function PickerRow({ label, value, placeholder = "Choose", onClick, id }: { label: string; value?: ReactNode; placeholder?: string; onClick: () => void; id?: string }) {
  return (
    <button id={id} type="button" onClick={onClick} className="st-row st-pressable st-picker-row">
      <span className="st-row__title">{label}</span>
      <span className={cx("st-picker-row__value st-truncate", !value && "st-picker-row__value--empty")}>{value || placeholder}</span>
      {SETA}
    </button>
  );
}

export type ListPickerProps<T extends string> = {
  label: string;
  options: Option<T>[];
  selection: T | "";
  onChange: (value: T) => void;
  /** At most this many rows are drawn; the search reaches all of them. */
  limit?: number;
  /** Texts (translate them). */
  searchPlaceholder?: string;
  emptyText?: string;
  countText?: (shown: number, total: number) => string;
  limitText?: (limit: number) => string;
};

/**
 * Choosing one item from a list that can be LONG (thousands): a search on top (ignores accents and case), the
 * list below, opened already scrolled to the chosen one. Lives inside a `Sheet`.
 */
export function ListPicker<T extends string>({
  label,
  options,
  selection,
  onChange,
  limit = 100,
  searchPlaceholder = "Search",
  emptyText = "Nothing with that name",
  countText = (n, total) => (n === total ? `${total} ${total === 1 ? "item" : "items"}` : `${n} of ${total}`),
  limitText = (n) => `Showing the first ${n}. Type part of the name to find the item.`,
}: ListPickerProps<T>) {
  const [busca, setBusca] = useState("");
  const termo = useDeferredValue(busca);
  const indice = useMemo(() => options.map((o) => ({ o, texto: normalizeSearch(`${o.label} ${o.description ?? ""} ${o.value}`) })), [options]);
  const visiveis = useMemo(() => {
    const t = normalizeSearch(termo);
    return t ? indice.filter((x) => x.texto.includes(t)).map((x) => x.o) : options;
  }, [options, indice, termo]);

  // The order never changes: the list opens scrolled to the chosen one.
  const caixa = useRef<HTMLDivElement>(null);
  const posicionou = useRef(false);
  useEffect(() => {
    if (posicionou.current || !selection) return;
    const alvo = caixa.current?.querySelector<HTMLElement>("[aria-selected=true]");
    if (!alvo) return;
    posicionou.current = true;
    alvo.scrollIntoView?.({ block: "center" });
  });

  return (
    <div ref={caixa} className="st-list-picker">
      {options.length > 6 && (
        <div className="st-list-picker__search">
          <SearchField value={busca} onChange={setBusca} label={`${searchPlaceholder} ${label.toLowerCase()}`} placeholder={searchPlaceholder} />
        </div>
      )}
      <p className="st-list-picker__count" aria-live="polite">
        {visiveis.length === 0 ? emptyText : countText(visiveis.length, options.length)}
      </p>
      {visiveis.length > limit && <p className="st-list-picker__note">{limitText(limit)}</p>}
      {visiveis.length > 0 && <OptionsList label={label} options={visiveis.slice(0, limit)} selection={selection} onChange={onChange} />}
    </div>
  );
}

/* ---- DatePicker ---- */

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const deIso = (s: string) => {
  const [a, m, d] = s.split("-").map(Number);
  return new Date(a, m - 1, d);
};
const diasAtras = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

export type DateShortcut = { label: string; value: string };

export type DatePickerProps = {
  /** ISO date (`YYYY-MM-DD`), or "" for none. */
  value: string;
  onChange: (iso: string) => void;
  title?: string;
  /** Days after `max` (or before `min`) are off. ISO dates. */
  max?: string;
  min?: string;
  /** Month and weekday names, and the button label. Default: the browser's language. */
  locale?: string;
  /** Quick choices above the calendar (default: today and yesterday). */
  shortcuts?: DateShortcut[];
  placeholder?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  disabled?: boolean;
  id?: string;
};

/**
 * A compact date button that opens a calendar in a sheet (the same on iPhone and Android, unlike the native input).
 * Shortcuts on top solve the common case; choosing closes.
 */
export function DatePicker({
  value,
  onChange,
  title = "Date",
  max,
  min,
  locale,
  shortcuts = [
    { label: "Today", value: iso(new Date()) },
    { label: "Yesterday", value: diasAtras(1) },
  ],
  placeholder = "Choose",
  previousMonthLabel = "Previous month",
  nextMonthLabel = "Next month",
  disabled,
  id,
}: DatePickerProps) {
  const [aberta, setAberta] = useState(false);
  const [mesVisto, setMesVisto] = useState(() => {
    const d = value ? deIso(value) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const fmtMes = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
    // Only the first letter up ("Outubro de 2026", not "Outubro De 2026").
    return { format: (d: Date) => f.format(d).replace(/^\p{Ll}/u, (c) => c.toLocaleUpperCase(locale)) };
  }, [locale]);
  const fmtDia = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full" }), [locale]);
  const fmtCurto = useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }), [locale]);
  // Weekday initials starting on Sunday (2023-01-01 was a Sunday).
  const semana = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2023, 0, 1 + i)));
  }, [locale]);

  const abrir = () => {
    const d = value ? deIso(value) : new Date();
    setMesVisto(new Date(d.getFullYear(), d.getMonth(), 1));
    setAberta(true);
  };
  const escolher = (v: string) => {
    onChange(v);
    setAberta(false);
  };
  const fora = (v: string) => (max !== undefined && v > max) || (min !== undefined && v < min);

  const qtd = new Date(mesVisto.getFullYear(), mesVisto.getMonth() + 1, 0).getDate();
  const celulas: (string | null)[] = [...Array<null>(mesVisto.getDay()).fill(null), ...Array.from({ length: qtd }, (_, i) => iso(new Date(mesVisto.getFullYear(), mesVisto.getMonth(), i + 1)))];
  const seguinteFora = max !== undefined && iso(new Date(mesVisto.getFullYear(), mesVisto.getMonth() + 1, 1)) > max;
  const anteriorFora = min !== undefined && iso(new Date(mesVisto.getFullYear(), mesVisto.getMonth(), 0)) < min;
  const hoje = iso(new Date());
  const atalhos = shortcuts.filter((a) => !fora(a.value));

  return (
    <>
      <button type="button" id={id} onClick={abrir} disabled={disabled} aria-haspopup="dialog" aria-expanded={aberta} className={cx("st-date-button", aberta && "st-date-button--open", !value && "st-date-button--empty")}>
        {value ? fmtCurto.format(deIso(value)) : placeholder}
      </button>
      <Sheet isPresented={aberta} onDismiss={() => setAberta(false)} title={title}>
        <div className="st-date-picker">
          {atalhos.length > 0 && (
            <div className="st-date-picker__shortcuts">
              {atalhos.map((a) => (
                <button key={a.label} type="button" onClick={() => escolher(a.value)} className={cx("st-date-picker__shortcut", value === a.value && "st-date-picker__shortcut--selected")}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <div className="st-section__card st-calendar">
            <div className="st-calendar__header">
              <button type="button" onClick={() => setMesVisto(new Date(mesVisto.getFullYear(), mesVisto.getMonth() - 1, 1))} disabled={anteriorFora} aria-label={previousMonthLabel} className="st-calendar__nav">
                <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <p className="st-calendar__month" aria-live="polite">
                {fmtMes.format(mesVisto)}
              </p>
              <button type="button" onClick={() => setMesVisto(new Date(mesVisto.getFullYear(), mesVisto.getMonth() + 1, 1))} disabled={seguinteFora} aria-label={nextMonthLabel} className="st-calendar__nav">
                <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
            <div className="st-calendar__weekdays" aria-hidden>
              {semana.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="st-calendar__days" role="grid" aria-label={fmtMes.format(mesVisto)}>
              {celulas.map((c, i) =>
                c === null ? (
                  <span key={`v${i}`} />
                ) : (
                  <button
                    key={c}
                    type="button"
                    role="gridcell"
                    disabled={fora(c)}
                    aria-selected={c === value}
                    aria-label={fmtDia.format(deIso(c))}
                    onClick={() => escolher(c)}
                    className={cx("st-calendar__day", c === value && "st-calendar__day--selected", c === hoje && "st-calendar__day--today")}
                  >
                    {Number(c.slice(-2))}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}

/* ---- TimePicker ---- */

const ALTURA = 44;
const VISIVEIS = 5;
const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTOS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const agora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export type TimePickerProps = {
  /** `HH:MM`, or "" for none. */
  value: string;
  onChange: (time: string) => void;
  title?: string;
  nowLabel?: string;
  clearLabel?: string;
  doneLabel?: string;
  hourLabel?: string;
  minuteLabel?: string;
  disabled?: boolean;
  id?: string;
};

/** A compact time button that opens two wheels (hour, minute) in a sheet; they snap to the middle. */
export function TimePicker({ value, onChange, title = "Time", nowLabel = "Now", clearLabel = "Clear", doneLabel = "Done", hourLabel = "Hour", minuteLabel = "Minute", disabled, id }: TimePickerProps) {
  const [aberta, setAberta] = useState(false);
  const [rascunho, setRascunho] = useState(value || agora());
  const abrir = () => {
    setRascunho(value || agora());
    setAberta(true);
  };
  const gravar = (v: string) => {
    onChange(v);
    setAberta(false);
  };
  const [h, m] = rascunho.split(":");
  return (
    <>
      <button type="button" id={id} onClick={abrir} disabled={disabled} aria-haspopup="dialog" aria-expanded={aberta} className={cx("st-date-button st-date-button--time", aberta && "st-date-button--open", !value && "st-date-button--empty")}>
        {value || "--:--"}
      </button>
      <Sheet isPresented={aberta} onDismiss={() => setAberta(false)} title={title}>
        <div className="st-date-picker">
          <div className="st-section__card st-wheels">
            <span aria-hidden className="st-wheels__band" />
            <Roda rotulo={hourLabel} opcoes={HORAS} valor={h} aoMudar={(v) => setRascunho(`${v}:${m}`)} aberta={aberta} />
            <span aria-hidden className="st-wheels__colon">
              :
            </span>
            <Roda rotulo={minuteLabel} opcoes={MINUTOS} valor={m} aoMudar={(v) => setRascunho(`${h}:${v}`)} aberta={aberta} />
          </div>
          <div className="st-date-picker__shortcuts">
            <button type="button" onClick={() => gravar(agora())} className="st-date-picker__shortcut">
              {nowLabel}
            </button>
            <button type="button" onClick={() => gravar("")} className="st-date-picker__shortcut">
              {clearLabel}
            </button>
          </div>
          <button type="button" onClick={() => gravar(rascunho)} className="st-button st-button--large st-button--prominent">
            <span className="st-button__label">{doneLabel}</span>
          </button>
        </div>
      </Sheet>
    </>
  );
}

/** A wheel: a snapping list with half a height of room above and below, so the first and last fit the middle. */
function Roda({ rotulo, opcoes, valor, aoMudar, aberta }: { rotulo: string; opcoes: string[]; valor: string; aoMudar: (v: string) => void; aberta: boolean }) {
  const caixa = useRef<HTMLDivElement>(null);
  const parada = useRef<number | undefined>(undefined);
  const [centro, setCentro] = useState(Math.max(0, opcoes.indexOf(valor)));

  // On opening, the wheel starts at the current choice, without animating.
  useEffect(() => {
    if (!aberta) return;
    const i = Math.max(0, opcoes.indexOf(valor));
    const q = requestAnimationFrame(() => {
      if (caixa.current) caixa.current.scrollTop = i * ALTURA;
      setCentro(i);
    });
    return () => cancelAnimationFrame(q);
    // Only on opening: after that the scroll rules.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberta]);

  const aoRolar = () => {
    const el = caixa.current;
    if (!el) return;
    const i = Math.min(opcoes.length - 1, Math.max(0, Math.round(el.scrollTop / ALTURA)));
    setCentro(i);
    window.clearTimeout(parada.current);
    parada.current = window.setTimeout(() => aoMudar(opcoes[i]), 120);
  };

  return (
    <div
      ref={caixa}
      role="listbox"
      aria-label={rotulo}
      tabIndex={0}
      onScroll={aoRolar}
      onKeyDown={(e) => {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
        e.preventDefault();
        caixa.current?.scrollBy({ top: e.key === "ArrowDown" ? ALTURA : -ALTURA, behavior: "smooth" });
      }}
      className="st-wheel"
      style={{ height: ALTURA * VISIVEIS, paddingBlock: (ALTURA * (VISIVEIS - 1)) / 2 }}
    >
      {opcoes.map((o, i) => (
        <div
          key={o}
          role="option"
          aria-selected={i === centro}
          onClick={() => caixa.current?.scrollTo({ top: i * ALTURA, behavior: "smooth" })}
          className={cx("st-wheel__item", i === centro && "st-wheel__item--center")}
          style={{ height: ALTURA }}
        >
          {o}
        </div>
      ))}
    </div>
  );
}
