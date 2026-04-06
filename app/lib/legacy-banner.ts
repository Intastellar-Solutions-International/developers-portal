const DEFAULT_UNTIL_YEAR = 2026;

/** Former docs host — banner only for inbound links from here (see root loader `Referer`). */
export const LEGACY_DEVELOPERS_HOST = "developers.intastellarsolutions.com";

/**
 * True when the HTTP Referer points at the legacy developers site (any path).
 * Uses the `Referer` request header on the document load (not updated on SPA navigations).
 */
export function isReferrerFromLegacyDevelopersSite(
  refererHeader: string | null | undefined,
): boolean {
  if (refererHeader == null || refererHeader.trim() === "") return false;
  try {
    const { hostname } = new URL(refererHeader);
    return hostname.toLowerCase() === LEGACY_DEVELOPERS_HOST;
  } catch {
    return false;
  }
}

/** `?ref=legacy` on the document URL (e.g. 301 from old host appends this query param). */
export function hasLegacyBannerRefQuery(requestUrl: string): boolean {
  try {
    const u = new URL(requestUrl);
    return u.searchParams.get("ref")?.toLowerCase() === "legacy";
  } catch {
    return false;
  }
}

/** Either legacy-site Referer or `ref=legacy` on the request URL. */
export function requestSignalsLegacyMigrationBanner(request: Request): boolean {
  return (
    hasLegacyBannerRefQuery(request.url) ||
    isReferrerFromLegacyDevelopersSite(request.headers.get("Referer"))
  );
}

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
