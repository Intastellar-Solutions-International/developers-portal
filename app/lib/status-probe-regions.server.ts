/**
 * Multi-region status crons: each deployment calls `/api/status/cron` with a stable region id
 * (header, query, or env). Snapshots merge per-target latencies; history rows are tagged.
 */

import { defaultProbeRegionDisplayName } from "./status-probe-region-display";

let labelsCache: Record<string, string> | null = null;

function loadRegionLabels(): Record<string, string> {
  if (labelsCache) return labelsCache;
  const raw = process.env.STATUS_PROBE_REGION_LABELS?.trim();
  if (!raw) {
    labelsCache = {};
    return labelsCache;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      labelsCache = Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [
          normalizeRegionId(k),
          typeof v === "string" ? v : String(v),
        ]),
      );
      return labelsCache;
    }
  } catch {
    /* ignore */
  }
  labelsCache = {};
  return labelsCache;
}

export function normalizeRegionId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");
}

/**
 * `X-Status-Probe-Region` header, `?region=` on the cron URL, or `STATUS_PROBE_REGION` on the worker.
 */
export function parseProbeRegionFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const q = url.searchParams.get("region") ?? url.searchParams.get("probeRegion");
  if (q?.trim()) return normalizeRegionId(q);
  const h = request.headers.get("X-Status-Probe-Region")?.trim();
  if (h) return normalizeRegionId(h);
  return null;
}

export function probeRegionFromEnv(): string | null {
  const v = process.env.STATUS_PROBE_REGION?.trim();
  return v ? normalizeRegionId(v) : null;
}

/** Human label for UI (env JSON map or title-cased id). */
export function formatProbeRegionLabel(regionId: string): string {
  const fromEnv = loadRegionLabels()[regionId];
  if (fromEnv) return fromEnv;
  return defaultProbeRegionDisplayName(regionId);
}

/** Pass through the JSON map from env for the status page client (custom names only). */
export function getConfiguredProbeRegionLabels(): Record<string, string> {
  return { ...loadRegionLabels() };
}

/**
 * When set, uptime %, timelines, and incidents use only history rows from this region (plus legacy
 * rows with no `probeRegion`). Required for correct SLA math if multiple regional crons run each minute.
 */
export function canonicalProbeRegionForHistory(): string | null {
  const v = process.env.STATUS_CANONICAL_PROBE_REGION?.trim();
  return v ? normalizeRegionId(v) : null;
}
