export const COLOR_SCHEME_STORAGE_KEY = "inta-color-scheme";

/** Dispatched after storage changes so `<html className>` can update (React owns the class). */
export const COLOR_SCHEME_CHANGE_EVENT = "inta-color-scheme-change";

export function notifyColorSchemeChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COLOR_SCHEME_CHANGE_EVENT));
}

/** Subscribe to theme-related updates (custom event, storage, OS preference). */
export function subscribeColorScheme(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (e: StorageEvent) => {
    if (e.key === COLOR_SCHEME_STORAGE_KEY || e.key === null) onChange();
  };
  const onCustom = () => onChange();
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onMq = () => onChange();

  window.addEventListener("storage", onStorage);
  window.addEventListener(COLOR_SCHEME_CHANGE_EVENT, onCustom);
  mq.addEventListener("change", onMq);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COLOR_SCHEME_CHANGE_EVENT, onCustom);
    mq.removeEventListener("change", onMq);
  };
}

export function getColorSchemeIsDarkSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return resolvedColorSchemeIsDark(readStoredColorScheme());
}

export function getColorSchemeIsDarkServerSnapshot(): boolean {
  return false;
}

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

/**
 * Syncs `dark` on `<html>` for non-React callers (inline boot script only).
 * In the app, the root `Layout` sets `<html className="dark">` via `useSyncExternalStore`.
 */
export function applyColorSchemeToDocument(
  preference: ColorSchemePreference,
): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(
    "dark",
    resolvedColorSchemeIsDark(preference),
  );
}

/**
 * Cycles stored preference. From `system`, the next step is the **opposite** of the
 * resolved appearance — not always `light` — so one click actually changes the UI
 * when the site followed a light OS (system + light looked like light; forcing `light`
 * again was a no-op).
 */
export function cycleColorSchemePreference(
  current: ColorSchemePreference,
): ColorSchemePreference {
  if (current === "system") {
    return resolvedColorSchemeIsDark("system") ? "light" : "dark";
  }
  if (current === "light") return "dark";
  return "system";
}

export function colorSchemePreferenceLabel(p: ColorSchemePreference): string {
  if (p === "light") return "Light";
  if (p === "dark") return "Dark";
  return "System";
}
