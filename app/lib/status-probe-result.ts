/** One regional probe outcome merged into the public snapshot (`results[].regions`). */
export type StatusRegionalSlice = {
  ok: boolean;
  latencyMs: number;
  statusCode: number | null;
  error: string | null;
};

export type StatusProbeResult = {
  id: string;
  name: string;
  url: string;
  ok: boolean;
  statusCode: number | null;
  latencyMs: number;
  error: string | null;
  /** Set when multiple workers merge checks (see `saveStatusSnapshot` + regional cron). */
  regions?: Record<string, StatusRegionalSlice>;
};

/**
 * Live probes omit `regions`; Mongo merges each cron into `results[].regions[regionId]`
 * (default id `primary` when the worker sends no region). Call this wherever the UI needs a map.
 */
export function resolveRegionalSlices(
  r: StatusProbeResult,
  fallbackRegionId: string,
): {
  regions: Record<string, StatusRegionalSlice>;
  /** True when the map was built from the row’s aggregate fields, not `r.regions`. */
  synthesized: boolean;
} {
  const merged = r.regions;
  if (merged != null && Object.keys(merged).length > 0) {
    return { regions: merged, synthesized: false };
  }
  return {
    regions: {
      [fallbackRegionId]: {
        ok: r.ok,
        latencyMs: r.latencyMs,
        statusCode: r.statusCode,
        error: r.error,
      },
    },
    synthesized: true,
  };
}
