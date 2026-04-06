import {
  DEFAULT_LOCALE,
  INTA_LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "~/lib/i18n/locale";

function parseCookieHeader(cookieHeader: string | null): Map<string, string> {
  const m = new Map<string, string>();
  if (!cookieHeader) return m;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) m.set(k, decodeURIComponent(v));
  }
  return m;
}

/** First matching locale tag in Accept-Language (e.g. de-CH → de). */
function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header?.trim()) return null;
  for (const raw of header.split(",")) {
    const tag = raw.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;
    const base = tag.split("-")[0];
    if (base === "de" || tag.startsWith("de-")) return "de";
    if (base === "da" || tag.startsWith("da-")) return "da";
    if (base === "en" || tag.startsWith("en-")) return "en";
  }
  return null;
}

/**
 * Resolves UI locale: `inta_locale` cookie, then Accept-Language, then English.
 */
export function resolveLocaleFromRequest(request: Request): Locale {
  const cookies = parseCookieHeader(request.headers.get("Cookie"));
  const fromCookie = cookies.get(INTA_LOCALE_COOKIE);
  if (isLocale(fromCookie)) return fromCookie;

  const fromAl = localeFromAcceptLanguage(request.headers.get("Accept-Language"));
  if (fromAl) return fromAl;

  return DEFAULT_LOCALE;
}
