import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "~/lib/i18n/locale";

import { getLocaleFromPathname } from "./localized-path";

/**
 * Resolves UI locale from the URL path: `/de/...`, `/da/...`, `/fr/...`, `/nl/...` for localized trees;
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
  if (q && isLocale(q)) return q;

  const accept = request.headers.get("Accept-Language");
  if (accept) {
    for (const part of accept.split(",")) {
      const tag = part.trim().split(";")[0]?.trim().toLowerCase();
      if (!tag) continue;
      const primary = tag.split("-")[0]!;
      if (isLocale(primary)) return primary;
    }
  }

  return DEFAULT_LOCALE;
}
