import { ObjectId } from "mongodb";

import {
  formatDateTimeMediumUtc,
} from "~/lib/format-datetime";
import {
  labelsForTargetIds,
  normalizeAffectedTargetIds,
} from "~/lib/status-affected-targets";
import { getCollection } from "~/lib/mongodb.server";
import { STATUS_MANUAL_INCIDENTS_COLLECTION } from "~/lib/mongodb-schema.server";
import {
  MANUAL_INCIDENT_SEVERITIES,
  type ManualIncidentPublic,
  type ManualIncidentSeverity,
  type ManualIncidentUpdateNotifyPayload,
  type ManualIncidentUpdatePublic,
} from "~/lib/status-manual-incidents";
import { getStatusTargets } from "~/lib/status-targets.server";

export type {
  ManualIncidentPublic,
  ManualIncidentSeverity,
  ManualIncidentUpdateNotifyPayload,
};
export { MANUAL_INCIDENT_SEVERITIES };

export type ManualIncidentUpdateRow = {
  at: Date;
  authorEmail: string;
  fromSeverity: ManualIncidentSeverity;
  toSeverity: ManualIncidentSeverity;
  message: string;
};

export type ManualIncidentRow = {
  _id: ObjectId;
  title: string;
  body: string;
  severity: ManualIncidentSeverity;
  affectedTargetIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  authorEmail: string;
  resolvedAt: Date | null;
  updates?: ManualIncidentUpdateRow[];
  /** Set when removed from the public status page (soft delete); row kept for restore. */
  deletedAt?: Date;
};

function mapUpdatesToPublic(
  rows: ManualIncidentUpdateRow[] | undefined,
): ManualIncidentUpdatePublic[] {
  if (!rows?.length) return [];
  const mapped = rows.map((u) => ({
    at: u.at.toISOString(),
    atLabel: formatDateTimeMediumUtc(u.at.toISOString()),
    authorEmail: u.authorEmail,
    fromSeverity: u.fromSeverity,
    toSeverity: u.toSeverity,
    message: u.message,
  }));
  mapped.sort((a, b) => b.at.localeCompare(a.at));
  return mapped;
}

function rowToPublic(
  row: ManualIncidentRow,
  targets: ReturnType<typeof getStatusTargets>,
): ManualIncidentPublic {
  const iso = row.createdAt.toISOString();
  const res = row.resolvedAt;
  const resolvedIso = res ? res.toISOString() : null;
  const ids = row.affectedTargetIds ?? [];
  return {
    id: row._id.toHexString(),
    title: row.title,
    body: row.body,
    severity: row.severity,
    createdAt: iso,
    createdAtLabel: formatDateTimeMediumUtc(iso),
    authorEmail: row.authorEmail,
    resolvedAt: resolvedIso,
    resolvedAtLabel: resolvedIso ? formatDateTimeMediumUtc(resolvedIso) : null,
    affectedTargetIds: ids,
    affectedLabels: labelsForTargetIds(ids, targets),
    updates: mapUpdatesToPublic(row.updates),
  };
}

export async function listManualIncidentsPublic(
  limit = 25,
): Promise<ManualIncidentPublic[]> {
  const col = await getCollection<ManualIncidentRow>(
    STATUS_MANUAL_INCIDENTS_COLLECTION,
  );
  if (!col) return [];
  const targets = getStatusTargets();
  const rows = await col
    .find({ deletedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return rows.map((r) => rowToPublic(r, targets));
}

/**
 * Operator notices that could affect any moment in [rangeStart, rangeEnd] (for uptime adjustment).
 */
export async function listManualIncidentRowsOverlappingRange(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<ManualIncidentRow[]> {
  const col = await getCollection<ManualIncidentRow>(
    STATUS_MANUAL_INCIDENTS_COLLECTION,
  );
  if (!col) return [];
  return col
    .find({
      deletedAt: { $exists: false },
      createdAt: { $lte: rangeEnd },
      $or: [{ resolvedAt: null }, { resolvedAt: { $gt: rangeStart } }],
    })
    .sort({ createdAt: 1 })
    .limit(200)
    .toArray();
}

export async function listManualIncidentsForAdmin(
  limit = 100,
): Promise<ManualIncidentRow[]> {
  const col = await getCollection<ManualIncidentRow>(
    STATUS_MANUAL_INCIDENTS_COLLECTION,
  );
  if (!col) return [];
  return col.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function insertManualIncident(opts: {
  title: string;
  body: string;
  severity: ManualIncidentSeverity;
  authorEmail: string;
  affectedTargetIds?: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const title = opts.title.trim();
  const body = opts.body.trim();
  if (!title || title.length > 200) {
    return { ok: false, error: "Title is required (max 200 characters)." };
  }
  if (!body || body.length > 20000) {
    return { ok: false, error: "Report body is required (max 20,000 characters)." };
  }
  if (!MANUAL_INCIDENT_SEVERITIES.includes(opts.severity)) {
    return { ok: false, error: "Invalid severity." };
  }
  const validIds = new Set(getStatusTargets().map((t) => t.id));
  const affectedTargetIds = normalizeAffectedTargetIds(
    opts.affectedTargetIds ?? [],
    validIds,
  );
  const col = await getCollection<ManualIncidentRow>(
    STATUS_MANUAL_INCIDENTS_COLLECTION,
  );
  if (!col) return { ok: false, error: "MongoDB is not configured." };
  const now = new Date();
  const resolvedAt = opts.severity === "resolved" ? now : null;
  await col.insertOne({
    _id: new ObjectId(),
    title,
    body,
    severity: opts.severity,
    ...(affectedTargetIds.length ? { affectedTargetIds } : {}),
    createdAt: now,
    updatedAt: now,
    authorEmail: opts.authorEmail.trim().toLowerCase(),
    resolvedAt,
  });
  return { ok: true };
}

const MANUAL_INCIDENT_UPDATE_MESSAGE_MAX = 8000;

export type UpdateManualIncidentResult =
  | { ok: true; skipped: true }
  | { ok: true; skipped: false; notify: ManualIncidentUpdateNotifyPayload }
  | { ok: false; error: string };

export async function updateManualIncident(opts: {
  hexId: string;
  severity: ManualIncidentSeverity;
  message?: string;
  authorEmail: string;
}): Promise<UpdateManualIncidentResult> {
  if (!MANUAL_INCIDENT_SEVERITIES.includes(opts.severity)) {
    return { ok: false, error: "Invalid severity." };
  }
  const message = (opts.message ?? "").trim();
  if (message.length > MANUAL_INCIDENT_UPDATE_MESSAGE_MAX) {
    return {
      ok: false,
      error: `Update message is too long (max ${MANUAL_INCIDENT_UPDATE_MESSAGE_MAX} characters).`,
    };
  }
  let oid: ObjectId;
  try {
    oid = new ObjectId(opts.hexId);
  } catch {
    return { ok: false, error: "Invalid incident id." };
  }
  const col = await getCollection<ManualIncidentRow>(
    STATUS_MANUAL_INCIDENTS_COLLECTION,
  );
  if (!col) return { ok: false, error: "MongoDB is not configured." };
  const row = await col.findOne({ _id: oid });
  if (!row) return { ok: false, error: "Incident not found." };
  if (row.deletedAt) {
    return {
      ok: false,
      error: "This notice is archived. Restore it before editing.",
    };
  }
  const fromSev = row.severity;
  const toSev = opts.severity;
  if (fromSev === toSev && !message) {
    return { ok: true, skipped: true };
  }
  const now = new Date();
  const resolvedAt =
    fromSev === toSev
      ? row.resolvedAt
      : toSev === "resolved"
        ? (row.resolvedAt ?? now)
        : null;
  const authorEmail = opts.authorEmail.trim().toLowerCase();
  const newEntry: ManualIncidentUpdateRow = {
    at: now,
    authorEmail,
    fromSeverity: fromSev,
    toSeverity: toSev,
    message,
  };
  await col.updateOne(
    { _id: oid },
    {
      $set: {
        ...(fromSev !== toSev
          ? { severity: toSev, resolvedAt }
          : {}),
        updatedAt: now,
      },
      $push: { updates: newEntry },
    },
  );
  return {
    ok: true,
    skipped: false,
    notify: {
      title: row.title,
      body: row.body,
      fromSeverity: fromSev,
      toSeverity: toSev,
      ...(row.affectedTargetIds?.length
        ? { affectedTargetIds: row.affectedTargetIds }
        : {}),
      updateMessage: message,
    },
  };
}

/** Hide from public status / RSS / uptime; row remains in Mongo for restore. */
export async function archiveManualIncidentById(hexId: string): Promise<boolean> {
  let oid: ObjectId;
  try {
    oid = new ObjectId(hexId);
  } catch {
    return false;
  }
  const col = await getCollection<ManualIncidentRow>(
    STATUS_MANUAL_INCIDENTS_COLLECTION,
  );
  if (!col) return false;
  const now = new Date();
  const r = await col.updateOne(
    { _id: oid, deletedAt: { $exists: false } },
    { $set: { deletedAt: now, updatedAt: now } },
  );
  return r.matchedCount === 1;
}

export async function restoreManualIncidentById(hexId: string): Promise<boolean> {
  let oid: ObjectId;
  try {
    oid = new ObjectId(hexId);
  } catch {
    return false;
  }
  const col = await getCollection<ManualIncidentRow>(
    STATUS_MANUAL_INCIDENTS_COLLECTION,
  );
  if (!col) return false;
  const now = new Date();
  const r = await col.updateOne(
    { _id: oid, deletedAt: { $exists: true } },
    { $set: { updatedAt: now }, $unset: { deletedAt: "" } },
  );
  return r.matchedCount === 1;
}

/** Irreversible removal (e.g. GDPR). Prefer `archiveManualIncidentById` for normal ops. */
export async function purgeManualIncidentById(hexId: string): Promise<boolean> {
  let oid: ObjectId;
  try {
    oid = new ObjectId(hexId);
  } catch {
    return false;
  }
  const col = await getCollection<ManualIncidentRow>(
    STATUS_MANUAL_INCIDENTS_COLLECTION,
  );
  if (!col) return false;
  const r = await col.deleteOne({ _id: oid });
  return r.deletedCount === 1;
}
