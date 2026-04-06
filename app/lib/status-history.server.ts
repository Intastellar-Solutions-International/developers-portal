import {
  formatDateTimeMediumUtc,
  formatDateTimeShortUtc,
} from "./format-datetime";
import type { StatusProbeResult } from "./status-probe.server";
import { getCollection } from "./mongodb.server";
import { STATUS_HISTORY_COLLECTION } from "./mongodb-schema.server";

export type StatusHistoryRow = {
  checkedAt: Date;
  overallOk: boolean;
  results: Array<{ id: string; ok: boolean; latencyMs?: number }>;
};

export type StatusTimelinePoint = {
  ok: boolean;
  checkedAt: string;
  /** Precomputed on the server so SSR HTML matches hydration (no client `Intl`). */
  checkedAtLabel: string;
  latencyMs?: number;
};

export type StatusIncident = {
  checkedAt: string;
  checkedAtLabel: string;
  failedIds: string[];
};

function historyMaxPoints(): number {
  const n = Number(process.env.STATUS_HISTORY_POINTS);
  if (Number.isFinite(n) && n >= 1 && n <= 200) return Math.floor(n);
  return 48;
}

export function getStatusHistoryMaxPoints(): number {
  return historyMaxPoints();
}

/**
 * Record one cron run (minimal fields) for timelines. TTL on collection drops old rows.
 */
export async function appendStatusHistoryRun(
  results: StatusProbeResult[],
  overallOk: boolean,
): Promise<boolean> {
  const col = await getCollection<StatusHistoryRow>(STATUS_HISTORY_COLLECTION);
  if (!col) return false;
  await col.insertOne({
    checkedAt: new Date(),
    overallOk,
    results: results.map((r) => ({
      id: r.id,
      ok: r.ok,
      latencyMs: r.latencyMs,
    })),
  });
  return true;
}

/**
 * Latest `maxPoints` runs, oldest → newest per target (for left-to-right timelines).
 */
export async function getStatusTimelines(
  targetIds: string[],
  maxPoints?: number,
): Promise<Record<string, StatusTimelinePoint[]>> {
  const limit = maxPoints ?? historyMaxPoints();
  const empty = (): Record<string, StatusTimelinePoint[]> =>
    Object.fromEntries(targetIds.map((id) => [id, [] as StatusTimelinePoint[]]));

  const col = await getCollection<StatusHistoryRow>(STATUS_HISTORY_COLLECTION);
  if (!col || targetIds.length === 0) return empty();

  const rowsNewestFirst = await col
    .find({})
    .sort({ checkedAt: -1 })
    .limit(limit)
    .toArray();
  const rows = rowsNewestFirst.reverse();

  const out = empty();
  for (const row of rows) {
    const iso = row.checkedAt.toISOString();
    const label = formatDateTimeShortUtc(iso);
    for (const id of targetIds) {
      const hit = row.results.find((r) => r.id === id);
      out[id].push({
        ok: hit?.ok ?? false,
        checkedAt: iso,
        checkedAtLabel: label,
        latencyMs: hit?.latencyMs,
      });
    }
  }
  return out;
}

/**
 * Recent runs where at least one target failed (newest first).
 */
export async function getRecentStatusIncidents(
  limit = 25,
): Promise<StatusIncident[]> {
  const col = await getCollection<StatusHistoryRow>(STATUS_HISTORY_COLLECTION);
  if (!col) return [];
  const cap = Math.min(400, Math.max(limit * 8, 48));
  const rowsNewestFirst = await col
    .find({})
    .sort({ checkedAt: -1 })
    .limit(cap)
    .toArray();

  const out: StatusIncident[] = [];
  for (const row of rowsNewestFirst) {
    const failed = row.results.filter((r) => !r.ok);
    if (failed.length === 0) continue;
    const iso = row.checkedAt.toISOString();
    out.push({
      checkedAt: iso,
      checkedAtLabel: formatDateTimeMediumUtc(iso),
      failedIds: failed.map((f) => f.id),
    });
    if (out.length >= limit) break;
  }
  return out;
}
