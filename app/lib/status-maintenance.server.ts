import { labelsForTargetIds } from "~/lib/status-affected-targets";
import { getStatusTargets } from "~/lib/status-targets.server";

export type StatusMaintenanceWindow = {
  id: string;
  title: string;
  summary?: string;
  startsAt: string;
  endsAt: string;
  /** Monitor IDs from `getStatusTargets()` this window may affect (optional). */
  affectedTargetIds?: string[];
};

export type StatusMaintenanceWindowPublic = StatusMaintenanceWindow & {
  phase: "active" | "upcoming";
  startsAtLabel: string;
  endsAtLabel: string;
  /** Resolved names for `affectedTargetIds` (same order). */
  affectedLabels: string[];
};

function validTargetIdSet(): Set<string> {
  return new Set(getStatusTargets().map((t) => t.id));
}

function parseAffectedTargetIds(
  raw: unknown,
  validIds: Set<string>,
): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x !== "string") continue;
    const id = x.trim();
    if (!validIds.has(id) || out.includes(id)) continue;
    out.push(id);
  }
  return out.length ? out : undefined;
}

function parseMaintenanceJson(raw: string | undefined): StatusMaintenanceWindow[] {
  if (!raw?.trim()) return [];
  const validIds = validTargetIdSet();
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    const out: StatusMaintenanceWindow[] = [];
    for (const row of v) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id.trim() : "";
      const title = typeof o.title === "string" ? o.title.trim() : "";
      const summary =
        typeof o.summary === "string" && o.summary.trim()
          ? o.summary.trim()
          : undefined;
      const startsAt =
        typeof o.startsAt === "string" ? o.startsAt.trim() : "";
      const endsAt = typeof o.endsAt === "string" ? o.endsAt.trim() : "";
      if (!id || !title || !startsAt || !endsAt) continue;
      const startMs = Date.parse(startsAt);
      const endMs = Date.parse(endsAt);
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) continue;
      if (endMs <= startMs) continue;
      const affectedTargetIds = parseAffectedTargetIds(
        o.affectedTargetIds,
        validIds,
      );
      out.push({
        id,
        title,
        summary,
        startsAt: new Date(startMs).toISOString(),
        endsAt: new Date(endMs).toISOString(),
        ...(affectedTargetIds ? { affectedTargetIds } : {}),
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** Raw windows from `STATUS_MAINTENANCE_JSON` (validated). */
export function getConfiguredMaintenanceWindows(): StatusMaintenanceWindow[] {
  return parseMaintenanceJson(process.env.STATUS_MAINTENANCE_JSON);
}

export function mergeMaintenanceById(
  env: StatusMaintenanceWindow[],
  mongo: StatusMaintenanceWindow[],
): StatusMaintenanceWindow[] {
  const map = new Map<string, StatusMaintenanceWindow>();
  for (const w of env) map.set(w.id, w);
  for (const w of mongo) map.set(w.id, w);
  return [...map.values()];
}

/** Windows whose [startsAt, endsAt) intersects [rangeStart, rangeEnd] (inclusive bounds on range). */
export function filterMaintenanceWindowsOverlappingRange(
  windows: StatusMaintenanceWindow[],
  rangeStart: Date,
  rangeEnd: Date,
): StatusMaintenanceWindow[] {
  const a = rangeStart.getTime();
  const b = rangeEnd.getTime();
  return windows.filter((w) => {
    const startMs = Date.parse(w.startsAt);
    const endMs = Date.parse(w.endsAt);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return false;
    return startMs < b && endMs > a;
  });
}

/**
 * Windows that have not ended yet, with phase and preformatted UTC labels for SSR.
 * Pass `mongoWindows` from DB (future-only rows); they override env entries with the same `id`.
 */
export function getPublicMaintenanceWindows(
  formatUtc: (iso: string) => string,
  options?: { mongoWindows?: StatusMaintenanceWindow[]; nowMs?: number },
): StatusMaintenanceWindowPublic[] {
  const nowMs = options?.nowMs ?? Date.now();
  const mongo = options?.mongoWindows ?? [];
  const targets = getStatusTargets();
  const windows = mergeMaintenanceById(
    getConfiguredMaintenanceWindows(),
    mongo,
  );
  const views: StatusMaintenanceWindowPublic[] = [];
  for (const w of windows) {
    const startMs = Date.parse(w.startsAt);
    const endMs = Date.parse(w.endsAt);
    if (endMs <= nowMs) continue;
    const phase =
      nowMs >= startMs && nowMs < endMs ? "active" : "upcoming";
    const affectedLabels = labelsForTargetIds(w.affectedTargetIds, targets);
    views.push({
      ...w,
      phase,
      startsAtLabel: formatUtc(w.startsAt),
      endsAtLabel: formatUtc(w.endsAt),
      affectedLabels,
    });
  }
  views.sort((a, b) => {
    if (a.phase !== b.phase) return a.phase === "active" ? -1 : 1;
    return Date.parse(a.startsAt) - Date.parse(b.startsAt);
  });
  return views;
}
