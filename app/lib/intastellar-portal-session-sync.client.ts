/**
 * Client-only helpers — do not import from server modules.
 * POST the Intastellar bearer token so the server can mint `inta_portal_sess`
 * (works when `inta_acc` is not sent on requests due to cookie Domain quirks).
 */
export async function syncIntastellarPortalSession(token: string): Promise<boolean> {
  const t = token.trim();
  if (!t || t.length > 16_000) return false;
  const res = await fetch("/auth/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: t }),
  });
  return res.ok;
}

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
