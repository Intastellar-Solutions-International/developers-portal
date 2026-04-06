import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router";

import {
  I18N_CONTEXT_FALLBACK,
  I18nReactContext,
  type I18nContextValue,
} from "~/lib/i18n/i18n-react-context";
import { DEFAULT_LOCALE, isLocale, type Locale } from "~/lib/i18n/locale";
import { stripLocalePrefix, withLocalePrefix } from "~/lib/i18n/localized-path";
import { interpolate, translatePath } from "~/lib/i18n/messages";

export function useLocalizedHref(path: string): string {
  const ctx = useContext(I18nReactContext);
  const locale = ctx?.locale ?? DEFAULT_LOCALE;
  return withLocalePrefix(path, locale);
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [locale, setLocaleState] = useState<Locale>(
    isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE,
  );

  useEffect(() => {
    setLocaleState(isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE);
  }, [initialLocale]);

  const setLocale = useCallback(
    (next: Locale) => {
      const barePath = stripLocalePrefix(location.pathname);
      const target =
        withLocalePrefix(barePath, next) + location.search + location.hash;
      if (target === location.pathname + location.search + location.hash) {
        return;
      }
      navigate(target, { replace: true });
    },
    [navigate, location.pathname, location.search, location.hash],
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
