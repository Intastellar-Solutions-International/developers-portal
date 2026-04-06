const DEFAULT_UNTIL_YEAR = 2026;

function untilYearFromEnv(): number {
  const raw = import.meta.env.VITE_LEGACY_BANNER_UNTIL_YEAR;
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 2020 && n <= 2100) return Math.floor(n);
  return DEFAULT_UNTIL_YEAR;
}

/**
 * Whether the legacy migration banner should show at `nowMs`.
 * Cutoff: end of `VITE_LEGACY_BANNER_UNTIL_YEAR` (default 2026), 23:59:59.999 UTC.
 */
export function isLegacyBannerActiveAt(nowMs: number): boolean {
  const year = untilYearFromEnv();
  const endOfYearUtc = Date.UTC(year, 11, 31, 23, 59, 59, 999);
  return nowMs <= endOfYearUtc;
}
