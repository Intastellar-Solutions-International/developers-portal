export const COLOR_SCHEME_STORAGE_KEY = "inta-color-scheme";

/** User preference. `system` follows `prefers-color-scheme`. */
export type ColorSchemePreference = "light" | "dark" | "system";

export function readStoredColorScheme(): ColorSchemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* private mode */
  }
  return "system";
}

export function persistColorScheme(preference: ColorSchemePreference): void {
  if (typeof window === "undefined") return;
  try {
    if (preference === "system") {
      localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
    } else {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, preference);
    }
  } catch {
    /* ignore */
  }
}

export function resolvedColorSchemeIsDark(
  preference: ColorSchemePreference,
): boolean {
  if (preference === "dark") return true;
  if (preference === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Apply `dark` class on `<html>` to match preference + system. */
export function applyColorSchemeToDocument(
  preference: ColorSchemePreference,
): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(
    "dark",
    resolvedColorSchemeIsDark(preference),
  );
}

export function cycleColorSchemePreference(
  current: ColorSchemePreference,
): ColorSchemePreference {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}

export function colorSchemePreferenceLabel(p: ColorSchemePreference): string {
  if (p === "light") return "Light";
  if (p === "dark") return "Dark";
  return "System";
}
