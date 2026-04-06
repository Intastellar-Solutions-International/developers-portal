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
} from "~/lib/status-manual-incidents";
import { getStatusTargets } from "~/lib/status-targets.server";

export type { ManualIncidentPublic, ManualIncidentSeverity };
export { MANUAL_INCIDENT_SEVERITIES };

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
};

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
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return rows.map((r) => rowToPublic(r, targets));
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

export async function updateManualIncidentSeverity(opts: {
  hexId: string;
  severity: ManualIncidentSeverity;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!MANUAL_INCIDENT_SEVERITIES.includes(opts.severity)) {
    return { ok: false, error: "Invalid severity." };
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
  if (row.severity === opts.severity) {
    return { ok: true };
  }
  const now = new Date();
  const resolvedAt =
    opts.severity === "resolved"
      ? (row.resolvedAt ?? now)
      : null;
  await col.updateOne(
    { _id: oid },
    {
      $set: {
        severity: opts.severity,
        updatedAt: now,
        resolvedAt,
      },
    },
  );
  return { ok: true };
}

export async function deleteManualIncidentById(
  hexId: string,
): Promise<boolean> {
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
