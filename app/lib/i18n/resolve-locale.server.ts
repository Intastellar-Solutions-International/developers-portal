import {
  DEFAULT_LOCALE,
  parseLocaleFromLanguageTag,
  type Locale,
} from "~/lib/i18n/locale";

import { getLocaleFromPathname } from "./localized-path";

/**
 * Resolves UI locale from the URL path: `/de/...`, `/da/...`, `/fr/...`, `/nl/...`, `/pt-br/...` for localized trees;
 * unprefixed routes (e.g. `/`, `/docs/...`) use English.
 */
export function resolveLocaleFromRequest(request: Request): Locale {
  const pathname = new URL(request.url).pathname;
  return getLocaleFromPathname(pathname);
}

/**
 * Locale for `/api/*` routes (no `/de/…` prefix in the path). Uses `?locale=` when valid,
 * otherwise the first matching tag in `Accept-Language`, otherwise English.
 */
export function resolveLocaleForApiRequest(request: Request): Locale {
  const url = new URL(request.url);
  const q = url.searchParams.get("locale");
  const fromQuery = parseLocaleFromLanguageTag(q);
  if (fromQuery) return fromQuery;

  const accept = request.headers.get("Accept-Language");
  if (accept) {
    for (const part of accept.split(",")) {
      const tag = part.trim().split(";")[0]?.trim();
      const parsed = parseLocaleFromLanguageTag(tag);
      if (parsed) return parsed;
    }
  }

  return DEFAULT_LOCALE;
}
