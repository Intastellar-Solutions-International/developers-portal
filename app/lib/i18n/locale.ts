export const SUPPORTED_LOCALES = [
  "en",
  "de",
  "da",
  "fr",
  "nl",
  "pt-br",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Flag emoji per locale (English → GB, common for language pickers). */
export const LOCALE_FLAG_EMOJI: Record<Locale, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
  da: "🇩🇰",
  fr: "🇫🇷",
  nl: "🇳🇱",
  "pt-br": "🇧🇷",
};

/** BCP 47 tags for `<link rel="alternate" hreflang>`. */
export const HREFLANG_TAG: Record<Locale, string> = {
  en: "en",
  de: "de",
  da: "da",
  fr: "fr",
  nl: "nl",
  "pt-br": "pt-BR",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return (
    value === "en" ||
    value === "de" ||
    value === "da" ||
    value === "fr" ||
    value === "nl" ||
    value === "pt-br"
  );
}

/**
 * `?locale=` and Accept-Language tags. Unqualified `pt` maps to Brazilian Portuguese (`pt-br`);
 * `pt-PT` is not mapped (European Portuguese is not offered).
 */
export function parseLocaleFromLanguageTag(
  raw: string | undefined | null,
): Locale | null {
  if (raw == null) return null;
  const v = raw.trim().toLowerCase().replace(/_/g, "-");
  if (!v) return null;
  if (v === "pt-pt") return null;
  if (isLocale(v)) return v;
  if (v === "pt") return "pt-br";
  const primary = v.split("-")[0] ?? "";
  if (primary === "pt") return "pt-br";
  if (primary && isLocale(primary)) return primary;
  return null;
}

/** `<html lang>` — Brazilian locale uses BCP 47 `pt-BR`. */
export function localeToHtmlLang(locale: Locale): string {
  return locale === "pt-br" ? "pt-BR" : locale;
}

export function htmlLangToLocale(
  lang: string | undefined | null,
): Locale | null {
  if (lang == null || !lang.trim()) return null;
  const v = lang.trim().toLowerCase().replace(/_/g, "-");
  if (v === "pt-br") return "pt-br";
  return isLocale(v) ? v : null;
}
