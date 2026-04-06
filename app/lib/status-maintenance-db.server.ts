import { ObjectId } from "mongodb";

import { getCollection } from "~/lib/mongodb.server";
import { STATUS_MAINTENANCE_DB_COLLECTION } from "~/lib/mongodb-schema.server";
import type { StatusMaintenanceWindow } from "~/lib/status-maintenance.server";

export type MaintenanceWindowRow = {
  _id: ObjectId;
  id: string;
  title: string;
  summary?: string;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdByEmail: string;
};

const ID_RE = /^[a-z0-9][a-z0-9-]{0,62}$/i;

export function isValidMaintenanceId(id: string): boolean {
  return ID_RE.test(id.trim());
}

function rowToWindow(row: MaintenanceWindowRow): StatusMaintenanceWindow {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
  };
}

/** All windows from DB that have not ended (for merging into public status). */
export async function listFutureMaintenanceWindowsFromMongo(): Promise<
  StatusMaintenanceWindow[]
> {
  const col = await getCollection<MaintenanceWindowRow>(
    STATUS_MAINTENANCE_DB_COLLECTION,
  );
  if (!col) return [];
  const now = new Date();
  const rows = await col
    .find({ endsAt: { $gt: now } })
    .sort({ startsAt: 1 })
    .toArray();
  return rows.map(rowToWindow);
}

/** Admin table: recent windows including ended (newest first). */
export async function listMaintenanceWindowsForAdmin(
  limit = 100,
): Promise<MaintenanceWindowRow[]> {
  const col = await getCollection<MaintenanceWindowRow>(
    STATUS_MAINTENANCE_DB_COLLECTION,
  );
  if (!col) return [];
  return col.find({}).sort({ startsAt: -1 }).limit(limit).toArray();
}

export async function insertMaintenanceWindow(opts: {
  id: string;
  title: string;
  summary?: string;
  startsAt: Date;
  endsAt: Date;
  createdByEmail: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidMaintenanceId(opts.id)) {
    return { ok: false, error: "Invalid id (use letters, numbers, hyphens; max 63 chars)." };
  }
  if (opts.endsAt.getTime() <= opts.startsAt.getTime()) {
    return { ok: false, error: "End time must be after start time." };
  }
  const col = await getCollection<MaintenanceWindowRow>(
    STATUS_MAINTENANCE_DB_COLLECTION,
  );
  if (!col) return { ok: false, error: "MongoDB is not configured." };
  const now = new Date();
  try {
    await col.insertOne({
      _id: new ObjectId(),
      id: opts.id.trim(),
      title: opts.title.trim(),
      summary: opts.summary?.trim() || undefined,
      startsAt: opts.startsAt,
      endsAt: opts.endsAt,
      createdAt: now,
      updatedAt: now,
      createdByEmail: opts.createdByEmail.trim().toLowerCase(),
    });
    return { ok: true };
  } catch (e: unknown) {
    const code = (e as { code?: number })?.code;
    if (code === 11000) {
      return { ok: false, error: "A window with this id already exists." };
    }
    return { ok: false, error: "Could not save maintenance window." };
  }
}

export async function deleteMaintenanceWindowById(
  id: string,
): Promise<boolean> {
  const col = await getCollection<MaintenanceWindowRow>(
    STATUS_MAINTENANCE_DB_COLLECTION,
  );
  if (!col) return false;
  const r = await col.deleteOne({ id: id.trim() });
  return r.deletedCount === 1;
}
