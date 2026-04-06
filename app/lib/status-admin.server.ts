/**
 * Comma-separated allowlist in `STATUS_ADMIN_EMAILS` (case-insensitive).
 * Required for `/internal/status-ops`; if unset or empty, the route is disabled.
 */
export function isStatusAdminEmail(email: string | undefined | null): boolean {
  const raw = process.env.STATUS_ADMIN_EMAILS?.trim();
  if (!raw) return false;
  const allowed = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  const e = email?.trim().toLowerCase();
  return Boolean(e && allowed.has(e));
}

export function statusAdminConfigured(): boolean {
  return Boolean(process.env.STATUS_ADMIN_EMAILS?.trim());
}
