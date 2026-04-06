export const SUPPORTED_LOCALES = ["en", "de", "da", "fr", "nl", "pt"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Flag emoji per locale (English → GB, common for language pickers). */
export const LOCALE_FLAG_EMOJI: Record<Locale, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
  da: "🇩🇰",
  fr: "🇫🇷",
  nl: "🇳🇱",
  pt: "🇧🇷",
};

/** BCP 47 tags for `<link rel="alternate" hreflang>` (Brazilian Portuguese uses `pt-BR`). */
export const HREFLANG_TAG: Record<Locale, string> = {
  en: "en",
  de: "de",
  da: "da",
  fr: "fr",
  nl: "nl",
  pt: "pt-BR",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return (
    value === "en" ||
    value === "de" ||
    value === "da" ||
    value === "fr" ||
    value === "nl" ||
    value === "pt"
  );
}

/** `?locale=` and Accept-Language tags: full tag (e.g. pt-BR) or primary subtag (e.g. pt). */
export function parseLocaleFromLanguageTag(
  raw: string | undefined | null,
): Locale | null {
  if (raw == null) return null;
  const v = raw.trim().toLowerCase().replace(/_/g, "-");
  if (!v) return null;
  if (isLocale(v)) return v;
  const primary = v.split("-")[0];
  return primary && isLocale(primary) ? primary : null;
}

/** `<html lang>` — Brazilian Portuguese uses `pt-BR` while routes and `Locale` stay `pt`. */
export function localeToHtmlLang(locale: Locale): string {
  return locale === "pt" ? "pt-BR" : locale;
}

export function htmlLangToLocale(
  lang: string | undefined | null,
): Locale | null {
  if (lang == null || !lang.trim()) return null;
  const v = lang.trim().toLowerCase().replace(/_/g, "-");
  if (v === "pt-br") return "pt";
  return isLocale(v) ? v : null;
}
