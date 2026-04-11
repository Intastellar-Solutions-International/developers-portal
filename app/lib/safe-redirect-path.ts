/**
 * True when `raw` is a safe in-app navigation target (same-site path + optional
 * query/hash). Rejects protocol-relative URLs and embedded schemes.
 */
export function isSafeInternalRedirect(
  raw: string | null | undefined,
): raw is string {
  if (raw == null) return false;
  const t = raw.trim();
  if (t === "" || !t.startsWith("/")) return false;
  if (t.startsWith("//")) return false;
  if (t.includes("\\")) return false;
  if (t.length > 2048) return false;
  const lower = t.toLowerCase();
  if (lower.includes("://")) return false;
  if (lower.includes("@")) return false;
  return true;
}
