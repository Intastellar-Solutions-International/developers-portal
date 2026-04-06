import { DEFAULT_LOCALE, isLocale, type Locale } from "~/lib/i18n/locale";

/** First path segment when it is a supported non-default locale prefix (`/de/...`, `/fr/...`, etc.). */
export function getLocaleFromPathname(pathname: string): Locale {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (isLocale(seg) && seg !== DEFAULT_LOCALE) return seg;
  return DEFAULT_LOCALE;
}

/**
 * Removes a leading locale segment (`/de`, `/fr`, …). English (unprefixed) URLs are unchanged.
 */
export function stripLocalePrefix(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!isLocale(seg) || seg === DEFAULT_LOCALE) {
    return pathname === "" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  }
  const rest = pathname.replace(new RegExp(`^/${seg}(?=/|$)`), "") || "/";
  return rest.startsWith("/") ? rest : `/${rest}`;
}

/**
 * Prefixes pathname with `/{locale}` when needed. English uses no prefix (default locale).
 */
export function withLocalePrefix(pathname: string, locale: Locale): string {
  const normalized =
    pathname === "" || pathname === "/"
      ? "/"
      : pathname.startsWith("/")
        ? pathname
        : `/${pathname}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}
