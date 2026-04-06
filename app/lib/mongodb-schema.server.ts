import type { Db, IndexDescription } from "mongodb";

/** Portal user accounts (linked SSO / OAuth identities). */
export const USER_ACCOUNTS_COLLECTION = "user_accounts";

/** Hashed developer API keys; optional `ownerAccountId` links to `user_accounts`. */
export const API_KEYS_COLLECTION = "api_keys";

/** Latest uptime snapshot written by `/api/status/cron` (single doc `_id: "current"`). */
export const STATUS_SNAPSHOT_COLLECTION = "platform_status";

/** Append-only cron runs for per-monitor timelines (TTL on `checkedAt`). */
export const STATUS_HISTORY_COLLECTION = "platform_status_history";

/** Scheduled maintenance windows managed from `/internal/status-ops` (merged with env). */
export const STATUS_MAINTENANCE_DB_COLLECTION = "status_maintenance_windows";

/** Manual incident reports filed by operators (shown on /status). */
export const STATUS_MANUAL_INCIDENTS_COLLECTION = "status_manual_incidents";

/**
 * MongoDB JSON Schema validators (`createCollection` / `collMod`).
 * @see https://www.mongodb.com/docs/manual/reference/operator/query/jsonSchema/
 */
const userAccountIdentitySchema = {
  bsonType: "object",
  required: ["provider", "subject", "linkedAt"],
  properties: {
    provider: { enum: ["intastellar", "github"] },
    subject: { bsonType: "string" },
    email: { bsonType: "string" },
    login: { bsonType: "string" },
    avatarUrl: { bsonType: "string" },
    linkedAt: { bsonType: "date" },
  },
  additionalProperties: true,
} as const;

const userAccountJsonSchema = {
  bsonType: "object",
  required: ["identities", "createdAt", "updatedAt"],
  properties: {
    primaryEmail: { bsonType: "string" },
    displayName: { bsonType: "string" },
    avatarUrl: { bsonType: "string" },
    identities: {
      bsonType: "array",
      minItems: 1,
      items: userAccountIdentitySchema,
    },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" },
  },
  additionalProperties: true,
} as const;

const apiKeyJsonSchema = {
  bsonType: "object",
  required: ["ownerEmail", "label", "keyHash", "keyPrefix", "createdAt", "revokedAt"],
  properties: {
    ownerAccountId: { bsonType: ["objectId", "null"] },
    ownerEmail: { bsonType: "string" },
    label: { bsonType: "string" },
    keyHash: { bsonType: "string" },
    keyPrefix: { bsonType: "string" },
    createdAt: { bsonType: "date" },
    revokedAt: { bsonType: ["date", "null"] },
    /** Hostname for Intastellar Sign-In (e.g. app.example.com). */
    signInDomain: { bsonType: ["string", "null"] },
    /** HTTPS URL of logo shown in sign-in flows. */
    signInLogoUrl: { bsonType: ["string", "null"] },
    /** AES-256-GCM ciphertext (base64url) so the owner can reveal the key later in the portal. */
    keyCiphertext: { bsonType: ["string", "null"] },
  },
  additionalProperties: true,
} as const;

const USER_ACCOUNT_INDEXES: IndexDescription[] = [
  {
    key: { "identities.provider": 1, "identities.subject": 1 },
    unique: true,
    name: "identities_provider_subject_unique",
  },
  { key: { primaryEmail: 1 }, name: "primaryEmail_1" },
  { key: { updatedAt: -1 }, name: "updatedAt_-1" },
];

const API_KEY_INDEXES: IndexDescription[] = [
  {
    key: { ownerEmail: 1, revokedAt: 1 },
    name: "ownerEmail_1_revokedAt_1",
  },
  {
    key: { ownerEmail: 1, createdAt: -1 },
    name: "ownerEmail_1_createdAt_-1",
  },
  {
    key: { ownerAccountId: 1, revokedAt: 1 },
    name: "ownerAccountId_1_revokedAt_1",
  },
  {
    key: { ownerAccountId: 1, createdAt: -1 },
    name: "ownerAccountId_1_createdAt_-1",
  },
];

let schemaEnsurePromise: Promise<void> | null = null;

async function collectionExists(db: Db, name: string): Promise<boolean> {
  const found = await db.listCollections({ name }, { nameOnly: true }).toArray();
  return found.length > 0;
}

async function ensureUserAccountsCollection(db: Db): Promise<void> {
  if (!(await collectionExists(db, USER_ACCOUNTS_COLLECTION))) {
    await db.createCollection(USER_ACCOUNTS_COLLECTION, {
      validator: { $jsonSchema: userAccountJsonSchema },
      validationLevel: "strict",
      validationAction: "error",
    });
  }
  await db.collection(USER_ACCOUNTS_COLLECTION).createIndexes(USER_ACCOUNT_INDEXES);
}

async function ensureApiKeysCollection(db: Db): Promise<void> {
  if (!(await collectionExists(db, API_KEYS_COLLECTION))) {
    await db.createCollection(API_KEYS_COLLECTION, {
      validator: { $jsonSchema: apiKeyJsonSchema },
      validationLevel: "strict",
      validationAction: "error",
    });
  }
  await db.collection(API_KEYS_COLLECTION).createIndexes(API_KEY_INDEXES);
}

async function ensureStatusSnapshotCollection(db: Db): Promise<void> {
  if (!(await collectionExists(db, STATUS_SNAPSHOT_COLLECTION))) {
    await db.createCollection(STATUS_SNAPSHOT_COLLECTION);
  }
}

const STATUS_HISTORY_TTL_SECONDS = 14 * 24 * 60 * 60;

async function ensureStatusHistoryCollection(db: Db): Promise<void> {
  if (!(await collectionExists(db, STATUS_HISTORY_COLLECTION))) {
    await db.createCollection(STATUS_HISTORY_COLLECTION);
  }
  await db.collection(STATUS_HISTORY_COLLECTION).createIndex(
    { checkedAt: 1 },
    {
      name: "checkedAt_1_ttl",
      expireAfterSeconds: STATUS_HISTORY_TTL_SECONDS,
    },
  );
}

async function ensureStatusMaintenanceDbCollection(db: Db): Promise<void> {
  if (!(await collectionExists(db, STATUS_MAINTENANCE_DB_COLLECTION))) {
    await db.createCollection(STATUS_MAINTENANCE_DB_COLLECTION);
  }
  await db.collection(STATUS_MAINTENANCE_DB_COLLECTION).createIndex(
    { id: 1 },
    { unique: true, name: "maintenance_id_unique" },
  );
  await db.collection(STATUS_MAINTENANCE_DB_COLLECTION).createIndex(
    { endsAt: -1 },
    { name: "endsAt_-1" },
  );
}

async function ensureStatusManualIncidentsCollection(db: Db): Promise<void> {
  if (!(await collectionExists(db, STATUS_MANUAL_INCIDENTS_COLLECTION))) {
    await db.createCollection(STATUS_MANUAL_INCIDENTS_COLLECTION);
  }
  await db.collection(STATUS_MANUAL_INCIDENTS_COLLECTION).createIndex(
    { createdAt: -1 },
    { name: "createdAt_-1" },
  );
}

/**
 * Creates collections (with JSON Schema validators) and indexes for portal data.
 * Idempotent; safe to call on every DB handle acquisition.
 * Failures are logged and cleared so a later call can retry (same idea as the old per-collection index helpers).
 */
export async function ensureMongoDbSchema(db: Db): Promise<void> {
  if (!schemaEnsurePromise) {
    schemaEnsurePromise = (async () => {
      try {
        await ensureUserAccountsCollection(db);
        await ensureApiKeysCollection(db);
        await ensureStatusSnapshotCollection(db);
        await ensureStatusHistoryCollection(db);
        await ensureStatusMaintenanceDbCollection(db);
        await ensureStatusManualIncidentsCollection(db);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[mongodb] ensureMongoDbSchema failed:", err);
        }
        schemaEnsurePromise = null;
      }
    })();
  }
  await schemaEnsurePromise;
}
