import {
  formatDateTimeMediumUtc,
  formatDateTimeShortUtc,
} from "./format-datetime";
import type { StatusProbeResult } from "./status-probe.server";
import { getCollection } from "./mongodb.server";
import { STATUS_HISTORY_COLLECTION } from "./mongodb-schema.server";
import { listManualIncidentRowsOverlappingRange } from "./status-manual-incidents.server";
import { listMaintenanceWindowsOverlappingRange } from "./status-maintenance-db.server";
import {
  filterMaintenanceWindowsOverlappingRange,
  getConfiguredMaintenanceWindows,
  mergeMaintenanceById,
  type StatusMaintenanceWindow,
} from "./status-maintenance.server";

export type StatusHistoryRow = {
  checkedAt: Date;
  overallOk: boolean;
  results: Array<{
    id: string;
    ok: boolean;
    latencyMs?: number;
    /** From `StatusProbeResult.error` when the check failed. */
    error?: string | null;
    statusCode?: number | null;
  }>;
};

export type StatusTimelinePoint = {
  ok: boolean;
  checkedAt: string;
  /** Precomputed on the server so SSR HTML matches hydration (no client `Intl`). */
  checkedAtLabel: string;
  latencyMs?: number;
};

export type StatusIncidentFailure = {
  id: string;
  /** Developer-facing reason from the probe (or a fallback for older stored rows). */
  summary: string;
};

export type StatusIncident = {
  checkedAt: string;
  checkedAtLabel: string;
  failures: StatusIncidentFailure[];
};

/** Rolling window for timelines, uptime, and incident log (UTC clock on `checkedAt`). */
function historyWindowHours(): number {
  const n = Number(process.env.STATUS_HISTORY_WINDOW_HOURS);
  if (Number.isFinite(n) && n >= 1 && n <= 168) return Math.floor(n);
  return 48;
}

/** Safety cap on how many history rows we load per request (cron may run more often than once per minute). */
function historyMaxRowsCap(): number {
  const n = Number(process.env.STATUS_HISTORY_MAX_ROWS);
  if (Number.isFinite(n) && n >= 50 && n <= 20000) return Math.floor(n);
  return 5000;
}

export function getStatusHistoryWindowHours(): number {
  return historyWindowHours();
}

export function getStatusHistoryMaxRowsCap(): number {
  return historyMaxRowsCap();
}

/**
 * Max rows loaded for history queries (safety cap). Kept for JSON/badge field names that
 * historically used “points”.
 */
export function getStatusHistoryMaxPoints(): number {
  return historyMaxRowsCap();
}

async function loadHistoryRowsNewestFirst(): Promise<StatusHistoryRow[]> {
  const col = await getCollection<StatusHistoryRow>(STATUS_HISTORY_COLLECTION);
  if (!col) return [];
  const sinceMs = Date.now() - historyWindowHours() * 60 * 60 * 1000;
  const since = new Date(sinceMs);
  return col
    .find({ checkedAt: { $gte: since } })
    .sort({ checkedAt: -1 })
    .limit(historyMaxRowsCap())
    .toArray();
}

export type StoredOverallUptime = {
  /** 0–100, one decimal. */
  percent: number;
  passedRuns: number;
  totalRuns: number;
};

function instantInMaintenanceWindow(
  w: StatusMaintenanceWindow,
  t: Date,
): boolean {
  const startMs = Date.parse(w.startsAt);
  const endMs = Date.parse(w.endsAt);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return false;
  const x = t.getTime();
  return x >= startMs && x < endMs;
}

function maintenanceWindowFailsRunAt(
  w: StatusMaintenanceWindow,
  row: StatusHistoryRow,
): boolean {
  if (!instantInMaintenanceWindow(w, row.checkedAt)) return false;
  const affected = w.affectedTargetIds;
  if (!affected?.length) return true;
  const ids = new Set(row.results.map((r) => r.id));
  return affected.some((id) => ids.has(id));
}

function manualIncidentActiveAt(
  incident: { createdAt: Date; resolvedAt: Date | null },
  t: Date,
): boolean {
  if (t.getTime() < incident.createdAt.getTime()) return false;
  if (
    incident.resolvedAt != null &&
    t.getTime() >= incident.resolvedAt.getTime()
  ) {
    return false;
  }
  return true;
}

function manualIncidentFailsRunAt(
  incident: {
    createdAt: Date;
    resolvedAt: Date | null;
    affectedTargetIds?: string[];
  },
  row: StatusHistoryRow,
): boolean {
  if (!manualIncidentActiveAt(incident, row.checkedAt)) return false;
  const affected = incident.affectedTargetIds;
  if (!affected?.length) return true;
  const ids = new Set(row.results.map((r) => r.id));
  return affected.some((id) => ids.has(id));
}

/**
 * A stored cron run counts toward headline uptime only when every probe passed and the timestamp
 * is not inside an active operator notice or scheduled maintenance window (env + Mongo) that
 * applies to the run (global, or overlapping monitored targets in that run).
 */
function runCountsAsPassedForUptime(
  row: StatusHistoryRow,
  maintenance: StatusMaintenanceWindow[],
  manualIncidents: Array<{
    createdAt: Date;
    resolvedAt: Date | null;
    affectedTargetIds?: string[];
  }>,
): boolean {
  if (!row.overallOk) return false;
  for (const inc of manualIncidents) {
    if (manualIncidentFailsRunAt(inc, row)) return false;
  }
  for (const w of maintenance) {
    if (maintenanceWindowFailsRunAt(w, row)) return false;
  }
  return true;
}

/**
 * Share of stored cron runs that count as “up” in the configured time window (same rows as
 * per-monitor timelines): `overallOk` plus no overlapping operator notice / maintenance for that
 * instant (see `runCountsAsPassedForUptime`).
 */
export async function getStoredOverallUptime(): Promise<StoredOverallUptime | null> {
  const rows = await loadHistoryRowsNewestFirst();
  if (rows.length === 0) return null;

  const times = rows.map((r) => r.checkedAt.getTime());
  const rangeStart = new Date(Math.min(...times));
  const rangeEnd = new Date(Math.max(...times));

  const envOverlapping = filterMaintenanceWindowsOverlappingRange(
    getConfiguredMaintenanceWindows(),
    rangeStart,
    rangeEnd,
  );
  const [mongoMaintOverlapping, manualIncidents] = await Promise.all([
    listMaintenanceWindowsOverlappingRange(rangeStart, rangeEnd),
    listManualIncidentRowsOverlappingRange(rangeStart, rangeEnd),
  ]);
  const maintenance = mergeMaintenanceById(
    envOverlapping,
    mongoMaintOverlapping,
  );

  const passedRuns = rows.filter((r) =>
    runCountsAsPassedForUptime(r, maintenance, manualIncidents),
  ).length;
  const totalRuns = rows.length;
  const percent =
    Math.round((passedRuns / totalRuns) * 1000) / 10;
  return { percent, passedRuns, totalRuns };
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
      error: r.error,
      statusCode: r.statusCode,
    })),
  });
  return true;
}

/**
 * Stored runs in the configured time window, oldest → newest per target (left-to-right timelines).
 */
export async function getStatusTimelines(
  targetIds: string[],
): Promise<Record<string, StatusTimelinePoint[]>> {
  const empty = (): Record<string, StatusTimelinePoint[]> =>
    Object.fromEntries(targetIds.map((id) => [id, [] as StatusTimelinePoint[]]));

  if (targetIds.length === 0) return empty();

  const rowsNewestFirst = await loadHistoryRowsNewestFirst();
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

function incidentFailureSummary(r: {
  error?: string | null;
  statusCode?: number | null;
}): string {
  const msg = r.error?.trim();
  if (msg) return msg;
  if (r.statusCode != null) {
    return `HTTP ${r.statusCode} — we mark 5xx and unreachable responses as a failed check.`;
  }
  return "No successful HTTP response (timeout, DNS, TLS, or network error).";
}

/**
 * Recent runs where at least one target failed (newest first), within the same history window as
 * timelines and uptime.
 */
export async function getRecentStatusIncidents(
  limit = 25,
): Promise<StatusIncident[]> {
  const rowsNewestFirst = await loadHistoryRowsNewestFirst();

  const out: StatusIncident[] = [];
  for (const row of rowsNewestFirst) {
    const failed = row.results.filter((r) => !r.ok);
    if (failed.length === 0) continue;
    const iso = row.checkedAt.toISOString();
    out.push({
      checkedAt: iso,
      checkedAtLabel: formatDateTimeMediumUtc(iso),
      failures: failed.map((f) => ({
        id: f.id,
        summary: incidentFailureSummary(f),
      })),
    });
    if (out.length >= limit) break;
  }
  return out;
}
