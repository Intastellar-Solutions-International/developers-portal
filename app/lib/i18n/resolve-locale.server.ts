import type { Locale } from "~/lib/i18n/locale";

import { getLocaleFromPathname } from "./localized-path";

/**
 * Resolves UI locale from the URL path: `/de/...`, `/da/...`, `/fr/...`, `/nl/...` for localized trees;
 * unprefixed routes (e.g. `/`, `/docs/...`) use English.
 */
export function resolveLocaleFromRequest(request: Request): Locale {
  const pathname = new URL(request.url).pathname;
  return getLocaleFromPathname(pathname);
}
