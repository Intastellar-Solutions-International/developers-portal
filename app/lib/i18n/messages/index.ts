import type { Locale } from "~/lib/i18n/locale";
import { da } from "./da";
import { de } from "./de";
import { en, type MessageTree } from "./en";
import { fr } from "./fr";
import { nl } from "./nl";
import { ptBr } from "./pt-br";

const trees: Record<Locale, MessageTree> = {
  en,
  de,
  da,
  fr,
  nl,
  "pt-br": ptBr,
};

function getLeaf(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let x: unknown = obj;
  for (const p of parts) {
    if (x == null || typeof x !== "object") return undefined;
    x = (x as Record<string, unknown>)[p];
  }
  return typeof x === "string" ? x : undefined;
}

/** Dot-path into the message tree; falls back to English, then to the key. */
export function translatePath(locale: Locale, path: string): string {
  return (
    getLeaf(trees[locale], path) ??
    getLeaf(trees.en, path) ??
    path
  );
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{{${k}}}`, String(v));
  }
  return s;
}
