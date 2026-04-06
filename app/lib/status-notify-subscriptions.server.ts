import { randomBytes } from "node:crypto";

import { ObjectId } from "mongodb";

import { getCollection } from "~/lib/mongodb.server";
import { STATUS_NOTIFY_SUBSCRIPTIONS_COLLECTION } from "~/lib/mongodb-schema.server";

export type StatusNotifySubscriptionRow = {
  _id: ObjectId;
  email: string;
  verifyToken: string;
  unsubscribeToken: string;
  verified: boolean;
  notifyMaintenance: boolean;
  notifyIncidents: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function randomToken(): string {
  return randomBytes(24).toString("hex");
}

export function isValidNotifyEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  return e.length <= 320 && EMAIL_RE.test(e);
}

export type RequestSubscriptionResult =
  | { ok: true; kind: "verify_sent"; verifyToken: string }
  | { ok: true; kind: "updated" }
  | { ok: false; error: string };

/**
 * Create or update subscription. Verified users get preference updates only; pending users get a new verify email.
 */
export async function requestStatusEmailSubscription(opts: {
  email: string;
  notifyMaintenance: boolean;
  notifyIncidents: boolean;
}): Promise<RequestSubscriptionResult> {
  if (!opts.notifyMaintenance && !opts.notifyIncidents) {
    return { ok: false, error: "Select at least one update type." };
  }
  const email = opts.email.trim().toLowerCase();
  if (!isValidNotifyEmail(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const col = await getCollection<StatusNotifySubscriptionRow>(
    STATUS_NOTIFY_SUBSCRIPTIONS_COLLECTION,
  );
  if (!col) {
    return { ok: false, error: "Subscriptions are not available right now." };
  }
  const now = new Date();
  const existing = await col.findOne({ email });
  if (existing?.verified) {
    await col.updateOne(
      { email },
      {
        $set: {
          notifyMaintenance: opts.notifyMaintenance,
          notifyIncidents: opts.notifyIncidents,
          updatedAt: now,
        },
      },
    );
    return { ok: true, kind: "updated" };
  }
  const verifyToken = randomToken();
  const unsubscribeToken = existing?.unsubscribeToken ?? randomToken();
  if (existing) {
    await col.updateOne(
      { email },
      {
        $set: {
          verifyToken,
          notifyMaintenance: opts.notifyMaintenance,
          notifyIncidents: opts.notifyIncidents,
          verified: false,
          updatedAt: now,
        },
      },
    );
    return { ok: true, kind: "verify_sent", verifyToken };
  }
  await col.insertOne({
    _id: new ObjectId(),
    email,
    verifyToken,
    unsubscribeToken,
    verified: false,
    notifyMaintenance: opts.notifyMaintenance,
    notifyIncidents: opts.notifyIncidents,
    createdAt: now,
    updatedAt: now,
  });
  return { ok: true, kind: "verify_sent", verifyToken };
}

export async function verifyStatusSubscriptionByToken(
  token: string,
): Promise<boolean> {
  const t = token.trim();
  if (!t) return false;
  const col = await getCollection<StatusNotifySubscriptionRow>(
    STATUS_NOTIFY_SUBSCRIPTIONS_COLLECTION,
  );
  if (!col) return false;
  const now = new Date();
  const r = await col.updateOne(
    { verifyToken: t, verified: false },
    { $set: { verified: true, updatedAt: now } },
  );
  return r.modifiedCount === 1;
}

export async function deleteStatusSubscriptionByUnsubscribeToken(
  token: string,
): Promise<boolean> {
  const t = token.trim();
  if (!t) return false;
  const col = await getCollection<StatusNotifySubscriptionRow>(
    STATUS_NOTIFY_SUBSCRIPTIONS_COLLECTION,
  );
  if (!col) return false;
  const r = await col.deleteOne({ unsubscribeToken: t });
  return r.deletedCount === 1;
}

export async function listVerifiedSubscribersForTopic(
  topic: "maintenance" | "incidents",
): Promise<{ email: string; unsubscribeToken: string }[]> {
  const col = await getCollection<StatusNotifySubscriptionRow>(
    STATUS_NOTIFY_SUBSCRIPTIONS_COLLECTION,
  );
  if (!col) return [];
  const flag =
    topic === "maintenance" ? "notifyMaintenance" : "notifyIncidents";
  const rows = await col
    .find({ verified: true, [flag]: true })
    .project({ email: 1, unsubscribeToken: 1, _id: 0 })
    .toArray();
  return rows.map((r) => ({
    email: r.email,
    unsubscribeToken: r.unsubscribeToken,
  }));
}
