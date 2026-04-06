export const INTA_LOCALE_COOKIE = "inta_locale";

export const SUPPORTED_LOCALES = ["en", "de", "da"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Flag emoji per locale (English → GB, common for language pickers). */
export const LOCALE_FLAG_EMOJI: Record<Locale, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
  da: "🇩🇰",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return (
    value === "en" ||
    value === "de" ||
    value === "da"
  );
}
