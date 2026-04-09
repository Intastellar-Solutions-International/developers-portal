import type { StatusProbeResult } from "~/lib/status-probe.server";
import type { StatusSnapshotPublic } from "~/lib/status-snapshot.server";

/**
 * Probes that are failing this run but were not failing in the previous snapshot
 * (or had no prior snapshot). Used to email once per incident, not every cron tick.
 */
export function newlyFailingProbeResults(
  previous: StatusSnapshotPublic | null,
  next: StatusProbeResult[],
): StatusProbeResult[] {
  const prevById = new Map(
    (previous?.results ?? []).map((r) => [r.id, r] as const),
  );
  const out: StatusProbeResult[] = [];
  for (const r of next) {
    if (r.ok) continue;
    const p = prevById.get(r.id);
    if (p?.ok === false) continue;
    out.push(r);
  }
  return out;
}

/**
 * Same as {@link newlyFailingProbeResults}, but only considers this region’s slice so each worker
 * can alert when *its* probe starts failing without repeating while other regions stay down.
 */
export function newlyFailingProbeResultsForRegion(
  previous: StatusSnapshotPublic | null,
  next: StatusProbeResult[],
  probeRegion: string,
): StatusProbeResult[] {
  const prevById = new Map(
    (previous?.results ?? []).map((r) => [r.id, r] as const),
  );
  const out: StatusProbeResult[] = [];
  for (const r of next) {
    if (r.ok) continue;
    const p = prevById.get(r.id);
    const prevRegionOk = p?.regions?.[probeRegion]?.ok ?? p?.ok ?? true;
    if (prevRegionOk === false) continue;
    out.push(r);
  }
  return out;
}
