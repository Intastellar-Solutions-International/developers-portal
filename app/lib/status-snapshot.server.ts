import type {
  StatusProbeResult,
  StatusRegionalSlice,
} from "./status-probe.server";
import {
  canonicalProbeRegionForHistory,
  normalizeRegionId,
} from "./status-probe-regions.server";
import { getCollection } from "./mongodb.server";
import { STATUS_SNAPSHOT_COLLECTION } from "./mongodb-schema.server";

const SNAPSHOT_ID = "current" as const;

export type StatusSnapshotRow = {
  _id: typeof SNAPSHOT_ID;
  checkedAt: Date;
  overallOk: boolean;
  results: StatusProbeResult[];
};

export type StatusSnapshotPublic = {
  checkedAt: string;
  overallOk: boolean;
  results: StatusProbeResult[];
};

function toPublic(row: StatusSnapshotRow): StatusSnapshotPublic {
  return {
    checkedAt: row.checkedAt.toISOString(),
    overallOk: row.overallOk,
    results: row.results,
  };
}

function mergeOneTarget(
  prev: StatusProbeResult | undefined,
  incoming: StatusProbeResult,
  regionId: string,
): StatusProbeResult {
  const regions: Record<string, StatusRegionalSlice> = {
    ...(prev?.regions ?? {}),
  };
  regions[regionId] = {
    ok: incoming.ok,
    latencyMs: incoming.latencyMs,
    statusCode: incoming.statusCode,
    error: incoming.error,
  };
  const entries = Object.entries(regions);
  const slices = Object.values(regions);
  const allOk = slices.every((s) => s.ok);
  const canonical = canonicalProbeRegionForHistory();
  const firstFail = entries.find(([, s]) => !s.ok);

  let primary: StatusRegionalSlice;
  if (canonical && regions[canonical]) {
    primary = regions[canonical];
  } else if (slices.length === 1) {
    primary = slices[0]!;
  } else {
    const avgMs = Math.round(
      slices.reduce((a, s) => a + s.latencyMs, 0) / slices.length,
    );
    primary = {
      ok: allOk,
      latencyMs: avgMs,
      statusCode: incoming.statusCode,
      error: incoming.error,
    };
  }

  return {
    ...incoming,
    regions,
    ok: allOk,
    latencyMs: primary.latencyMs,
    statusCode: allOk
      ? primary.statusCode
      : (firstFail?.[1].statusCode ?? primary.statusCode),
    error: allOk
      ? null
      : (firstFail?.[1].error ?? primary.error),
  };
}

export type SaveStatusSnapshotOptions = {
  /**
   * Merge this run into `results[].regions[regionId]`. When omitted, uses `primary` so a plain
   * Vercel Cron hit (no `?region=` / env) still persists per-region latency instead of stripping it.
   */
  probeRegion?: string | null;
};

export async function saveStatusSnapshot(
  results: StatusProbeResult[],
  overallOk: boolean,
  options?: SaveStatusSnapshotOptions,
): Promise<boolean> {
  const col = await getCollection<StatusSnapshotRow>(STATUS_SNAPSHOT_COLLECTION);
  if (!col) return false;

  const raw = options?.probeRegion?.trim();
  const regionKey = raw ? normalizeRegionId(raw) : "primary";

  const prevRow = await col.findOne({ _id: SNAPSHOT_ID });
  const prevById = new Map(
    (prevRow?.results ?? []).map((r) => [r.id, r] as const),
  );

  const merged = results.map((incoming) => {
    const prevR = prevById.get(incoming.id);
    return mergeOneTarget(prevR, incoming, regionKey);
  });

  const mergedOk = merged.every((r) => r.ok);
  const doc: StatusSnapshotRow = {
    _id: SNAPSHOT_ID,
    checkedAt: new Date(),
    overallOk: mergedOk,
    results: merged,
  };
  await col.replaceOne({ _id: SNAPSHOT_ID }, doc, { upsert: true });
  return true;
}

export async function getLatestStatusSnapshot(): Promise<StatusSnapshotPublic | null> {
  const col = await getCollection<StatusSnapshotRow>(STATUS_SNAPSHOT_COLLECTION);
  if (!col) return null;
  const row = await col.findOne({ _id: SNAPSHOT_ID });
  if (!row) return null;
  return toPublic(row);
}
