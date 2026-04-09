/** Shared client + server — no env; used when `STATUS_PROBE_REGION_LABELS` has no entry. */
export function defaultProbeRegionDisplayName(regionId: string): string {
  return regionId
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
