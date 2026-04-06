import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  notifyColorSchemeChanged,
  persistColorScheme,
  readStoredColorScheme,
  type ColorSchemePreference,
} from "~/lib/color-scheme";

type ColorSchemeContextValue = {
  preference: ColorSchemePreference;
  setPreference: (p: ColorSchemePreference) => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  /** SSR + first client paint: stable so markup matches server; sync from storage in layout. */
  const [preference, setPreferenceState] =
    useState<ColorSchemePreference>("system");

  useLayoutEffect(() => {
    const p = readStoredColorScheme();
    setPreferenceState(p);
    notifyColorSchemeChanged();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onOsChange = () => {
      if (readStoredColorScheme() !== "system") return;
      notifyColorSchemeChanged();
    };
    mq.addEventListener("change", onOsChange);
    return () => mq.removeEventListener("change", onOsChange);
  }, []);

  const setPreference = useCallback((p: ColorSchemePreference) => {
    persistColorScheme(p);
    setPreferenceState(p);
    notifyColorSchemeChanged();
  }, []);

  const value = useMemo(
    () => ({ preference, setPreference }),
    [preference, setPreference],
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error("useColorScheme must be used within ColorSchemeProvider");
  }
  return ctx;
}
