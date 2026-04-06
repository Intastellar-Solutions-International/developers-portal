import type { StatusProbeResult } from "./status-probe.server";
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

export async function saveStatusSnapshot(
  results: StatusProbeResult[],
  overallOk: boolean,
): Promise<boolean> {
  const col = await getCollection<StatusSnapshotRow>(STATUS_SNAPSHOT_COLLECTION);
  if (!col) return false;
  const doc: StatusSnapshotRow = {
    _id: SNAPSHOT_ID,
    checkedAt: new Date(),
    overallOk,
    results,
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
