import { createContext } from "react";

import { DEFAULT_LOCALE, type Locale } from "~/lib/i18n/locale";
import { interpolate, translatePath } from "~/lib/i18n/messages";

export type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
};

function fallbackT(
  path: string,
  vars?: Record<string, string | number>,
): string {
  const raw = translatePath(DEFAULT_LOCALE, path);
  return vars ? interpolate(raw, vars) : raw;
}

/** Stable fallback when no provider (e.g. Vite HMR recreated context). */
export const I18N_CONTEXT_FALLBACK: I18nContextValue = {
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: fallbackT,
};

/**
 * Lives in its own module so Fast Refresh on `i18n-provider.tsx` does not replace the context
 * object and strand existing providers.
 */
export const I18nReactContext = createContext<I18nContextValue | null>(null);
