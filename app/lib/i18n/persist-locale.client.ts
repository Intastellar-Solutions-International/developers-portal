import { INTA_LOCALE_COOKIE, type Locale } from "~/lib/i18n/locale";

/** Persists locale for SSR on the next request (with revalidation). */
export function persistLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${INTA_LOCALE_COOKIE}=${encodeURIComponent(locale)};Path=/;Max-Age=31536000;SameSite=Lax`;
}
