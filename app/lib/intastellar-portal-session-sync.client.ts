/**
 * Client-only — do not import from server modules.
 * Session minting uses `useFetcher().submit` to `/auth/session` (React Router
 * single-fetch / `.data`); a raw `fetch("/auth/session")` does not get the same
 * response handling and `Set-Cookie` may never stick in dev.
 */

/** SDK `inta_acc` is not HttpOnly, so it is visible on `document.cookie`. */
export function readIntaAccFromDocument(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)inta_acc=([^;]*)/i);
  const encoded = m?.[1]?.trim();
  if (!encoded) return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}
