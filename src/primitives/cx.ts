/** Joins class names, skipping the empty ones. */
export function cx(...nomes: Array<string | false | null | undefined>): string {
  return nomes.filter(Boolean).join(" ");
}
