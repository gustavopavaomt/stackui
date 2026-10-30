import { useState } from "react";

/** Words that never become an initial ("Bank of America" is BA). */
const LIGACOES = new Set(["de", "da", "do", "das", "dos", "e", "a", "o", "of", "the", "and"]);

/** Two initials from a name: "Pão Quente" → PQ; one word → its first two letters. Letters only ("3B Store" → BS). */
export function initials(name: string) {
  const palavras = name
    .split(/\s+/)
    .map((p) => p.replace(/[^\p{L}]/gu, ""))
    .filter((p) => p && !LIGACOES.has(p.toLowerCase()));
  if (!palavras.length) return "?";
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
  return (palavras[0][0] + palavras[1][0]).toUpperCase();
}

const CORES = ["--st-green", "--st-blue", "--st-orange", "--st-indigo", "--st-teal", "--st-red"];

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);

export type AvatarProps = {
  name: string;
  /** A photo; falls back to the monogram if it fails. */
  src?: string;
  /** Keeps the color stable (e.g. the record id); defaults to the name. */
  colorKey?: string | number;
  size?: number;
};

/** A monogram (the contacts style: soft gradient circle, white initials), or a photo. Decorative: say the name next to it. */
export function Avatar({ name, src, colorKey, size = 44 }: AvatarProps) {
  const [falhou, setFalhou] = useState(false);
  const cor = `var(${CORES[Math.abs(hash(String(colorKey ?? name))) % CORES.length]})`;
  if (src && !falhou) return <img src={src} alt="" aria-hidden width={size} height={size} onError={() => setFalhou(true)} className="st-avatar st-avatar--photo" />;
  return (
    <span aria-hidden className="st-avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(180deg, color-mix(in oklab, ${cor} 72%, white), ${cor})` }}>
      {initials(name)}
    </span>
  );
}
