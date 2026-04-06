import { createHmac, randomBytes } from "node:crypto";

import { type Collection, type Filter, ObjectId } from "mongodb";

import { API_KEYS_COLLECTION } from "./mongodb-schema.server";
import { getCollection } from "./mongodb.server";
const KEY_PREFIX = "inta_live_";

export type ApiKeyRecord = {
  /** Set for keys created after user_accounts rollout; legacy rows omit this. */
  ownerAccountId?: ObjectId | null;
  ownerEmail: string;
  label: string;
  keyHash: string;
  /** Short public fingerprint (not the secret). */
  keyPrefix: string;
  createdAt: Date;
  revokedAt: Date | null;
};

export type ApiKeyListItem = {
  id: string;
  label: string;
  keyPrefix: string;
  createdAt: string;
};

function hashApiKey(plaintext: string): string {
  const pepper = process.env.API_KEY_PEPPER?.trim();
  if (!pepper) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MISSING_PEPPER");
    }
    return createHmac("sha256", "dev-only-pepper-change-me")
      .update(plaintext)
      .digest("hex");
  }
  return createHmac("sha256", pepper).update(plaintext).digest("hex");
}

function activeKeysFilter(
  ownerAccountId: ObjectId | null,
  emailNorm: string,
): Filter<ApiKeyRecord> {
  if (ownerAccountId) {
    return {
      revokedAt: null,
      $or: [
        { ownerAccountId },
        {
          ownerEmail: emailNorm,
          $or: [
            { ownerAccountId: { $exists: false } },
            { ownerAccountId: null },
          ],
        },
      ],
    };
  }
  return { revokedAt: null, ownerEmail: emailNorm };
}

function revokeKeyFilter(
  keyId: ObjectId,
  ownerAccountId: ObjectId | null,
  emailNorm: string,
): Filter<ApiKeyRecord> {
  const base: Filter<ApiKeyRecord> = { _id: keyId, revokedAt: null };
  if (ownerAccountId) {
    return {
      ...base,
      $or: [
        { ownerAccountId },
        {
          ownerEmail: emailNorm,
          $or: [
            { ownerAccountId: { $exists: false } },
            { ownerAccountId: null },
          ],
        },
      ],
    };
  }
  return { ...base, ownerEmail: emailNorm };
}

export async function listApiKeysForUser(
  ownerAccountId: ObjectId | null,
  ownerEmail: string,
): Promise<ApiKeyListItem[]> {
  const coll = await getCollection<ApiKeyRecord>(API_KEYS_COLLECTION);
  if (!coll) return [];
  const norm = ownerEmail.trim().toLowerCase();
  const docs = await coll
    .find(activeKeysFilter(ownerAccountId, norm), {
      projection: { _id: 1, label: 1, keyPrefix: 1, createdAt: 1 },
    })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((d) => ({
    id: d._id.toHexString(),
    label: d.label,
    keyPrefix: d.keyPrefix,
    createdAt: d.createdAt.toISOString(),
  }));
}

export type CreateApiKeyResult =
  | { ok: true; plaintextKey: string; id: string }
  | { ok: false; error: string };

export async function createApiKey(
  ownerAccountId: ObjectId | null,
  ownerEmail: string,
  label: string,
): Promise<CreateApiKeyResult> {
  const coll = await getCollection<ApiKeyRecord>(API_KEYS_COLLECTION);
  if (!coll) {
    return { ok: false, error: "Database is not configured." };
  }

  const trimmedLabel = label.trim().slice(0, 120);
  if (!trimmedLabel) {
    return { ok: false, error: "Enter a label for this key." };
  }

  const secretBody = randomBytes(32).toString("hex");
  const plaintextKey = `${KEY_PREFIX}${secretBody}`;
  let keyHash: string;
  try {
    keyHash = hashApiKey(plaintextKey);
  } catch {
    return {
      ok: false,
      error:
        "Server misconfiguration: set API_KEY_PEPPER (long random secret) in production.",
    };
  }
  const keyPrefix = `${plaintextKey.slice(0, 14)}…`;

  const norm = ownerEmail.trim().toLowerCase();
  const now = new Date();
  const doc: ApiKeyRecord = {
    ownerEmail: norm,
    label: trimmedLabel,
    keyHash,
    keyPrefix,
    createdAt: now,
    revokedAt: null,
  };
  if (ownerAccountId) {
    doc.ownerAccountId = ownerAccountId;
  }

  const insertResult = await coll.insertOne(doc);

  return {
    ok: true,
    plaintextKey,
    id: insertResult.insertedId.toHexString(),
  };
}

export async function revokeApiKey(
  ownerAccountId: ObjectId | null,
  ownerEmail: string,
  keyId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const coll = await getCollection<ApiKeyRecord>(API_KEYS_COLLECTION);
  if (!coll) {
    return { ok: false, error: "Database is not configured." };
  }
  let oid: ObjectId;
  try {
    oid = new ObjectId(keyId);
  } catch {
    return { ok: false, error: "Invalid key id." };
  }
  const norm = ownerEmail.trim().toLowerCase();
  const res = await coll.updateOne(revokeKeyFilter(oid, ownerAccountId, norm), {
    $set: { revokedAt: new Date() },
  });
  if (res.matchedCount === 0) {
    return { ok: false, error: "Key not found or already revoked." };
  }
  return { ok: true };
}
