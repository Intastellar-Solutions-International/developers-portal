export const SUPPORTED_LOCALES = ["en", "de", "da", "fr", "nl"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Flag emoji per locale (English → GB, common for language pickers). */
export const LOCALE_FLAG_EMOJI: Record<Locale, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
  da: "🇩🇰",
  fr: "🇫🇷",
  nl: "🇳🇱",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return (
    value === "en" ||
    value === "de" ||
    value === "da" ||
    value === "fr" ||
    value === "nl"
  );
}
