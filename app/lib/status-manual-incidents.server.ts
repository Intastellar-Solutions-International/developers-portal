import { ObjectId } from "mongodb";

import {
  formatDateTimeMediumUtc,
} from "~/lib/format-datetime";
import { getCollection } from "~/lib/mongodb.server";
import { STATUS_MANUAL_INCIDENTS_COLLECTION } from "~/lib/mongodb-schema.server";
import {
  MANUAL_INCIDENT_SEVERITIES,
  type ManualIncidentPublic,
  type ManualIncidentSeverity,
} from "~/lib/status-manual-incidents";

export type { ManualIncidentPublic, ManualIncidentSeverity };
export { MANUAL_INCIDENT_SEVERITIES };

export type ManualIncidentRow = {
  _id: ObjectId;
  title: string;
  body: string;
  severity: ManualIncidentSeverity;
  createdAt: Date;
  updatedAt: Date;
  authorEmail: string;
  resolvedAt: Date | null;
};

function rowToPublic(row: ManualIncidentRow): ManualIncidentPublic {
  const iso = row.createdAt.toISOString();
  const res = row.resolvedAt;
  const resolvedIso = res ? res.toISOString() : null;
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
  };
}

export async function listManualIncidentsPublic(
  limit = 25,
): Promise<ManualIncidentPublic[]> {
  const col = await getCollection<ManualIncidentRow>(
    STATUS_MANUAL_INCIDENTS_COLLECTION,
  );
  if (!col) return [];
  const rows = await col
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return rows.map(rowToPublic);
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
    createdAt: now,
    updatedAt: now,
    authorEmail: opts.authorEmail.trim().toLowerCase(),
    resolvedAt,
  });
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
