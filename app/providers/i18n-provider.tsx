import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRevalidator } from "react-router";

import {
  I18N_CONTEXT_FALLBACK,
  I18nReactContext,
  type I18nContextValue,
} from "~/lib/i18n/i18n-react-context";
import { DEFAULT_LOCALE, isLocale, type Locale } from "~/lib/i18n/locale";
import { interpolate, translatePath } from "~/lib/i18n/messages";
import { persistLocaleCookie } from "~/lib/i18n/persist-locale.client";

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const revalidator = useRevalidator();
  const [locale, setLocaleState] = useState<Locale>(
    isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE,
  );

  useEffect(() => {
    setLocaleState(isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE);
  }, [initialLocale]);

  const setLocale = useCallback(
    (next: Locale) => {
      persistLocaleCookie(next);
      setLocaleState(next);
      revalidator.revalidate();
    },
    [revalidator],
  );

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const raw = translatePath(locale, path);
      return vars ? interpolate(raw, vars) : raw;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <I18nReactContext.Provider value={value}>{children}</I18nReactContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nReactContext);
  if (ctx) return ctx;
  if (import.meta.env.DEV) {
    console.warn(
      "[i18n] useI18n outside I18nProvider — using English fallback. Full reload if this persists after edits.",
    );
  }
  return I18N_CONTEXT_FALLBACK;
}
