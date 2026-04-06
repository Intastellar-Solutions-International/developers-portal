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
