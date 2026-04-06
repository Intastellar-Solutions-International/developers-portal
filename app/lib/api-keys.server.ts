import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";

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
  /** Hostname for Intastellar Sign-In branding / allowlists. */
  signInDomain?: string | null;
  /** HTTPS URL for logo in sign-in UI. */
  signInLogoUrl?: string | null;
  /**
   * Encrypted plaintext (AES-256-GCM); same server secret as hashing allows reveal in UI.
   * Legacy keys omit this — use “Create key” to replace.
   */
  keyCiphertext?: string | null;
};

export type ApiKeyListItem = {
  id: string;
  label: string;
  keyPrefix: string;
  createdAt: string;
  signInDomain: string | null;
  signInLogoUrl: string | null;
  /** True when the portal can decrypt and show the secret (eye icon). */
  canReveal: boolean;
};

const MAX_DOMAIN_LEN = 253;
const MAX_LOGO_URL_LEN = 2048;

/** Normalize pasted origin/URL to hostname, or null if empty / invalid. */
function parseSignInDomainInput(raw: string): string | null | "invalid" {
  const t = raw.trim().toLowerCase();
  if (!t) return null;
  try {
    const withProto = t.includes("://") ? t : `https://${t}`;
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "invalid";
    const host = u.hostname.replace(/^\[|\]$/g, "");
    if (!host || host.length > MAX_DOMAIN_LEN) return "invalid";
    return host;
  } catch {
    return "invalid";
  }
}

/** Require https URL for remote logo assets. */
function parseSignInLogoUrlInput(raw: string): string | null | "invalid" {
  const t = raw.trim();
  if (!t) return null;
  if (t.length > MAX_LOGO_URL_LEN) return "invalid";
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return "invalid";
  }
  if (u.protocol !== "https:") return "invalid";
  return u.href;
}

const GCM_IV_LEN = 12;
const GCM_TAG_LEN = 16;
const CIPHER = "aes-256-gcm" as const;
const ENC_CONTEXT = "inta-portal-api-key-ciphertext-v1";

/** 32-byte key derived from `API_KEY_PEPPER` (same as hashing). */
function apiKeyEncryptionKey(): Buffer | null {
  const pepper = process.env.API_KEY_PEPPER?.trim();
  if (!pepper) {
    if (process.env.NODE_ENV === "production") return null;
    return createHmac("sha256", "dev-only-pepper-change-me")
      .update(ENC_CONTEXT)
      .digest();
  }
  return createHmac("sha256", pepper).update(ENC_CONTEXT).digest();
}

function encryptApiKeyPlaintext(plaintext: string): string | null {
  const key = apiKeyEncryptionKey();
  if (!key) return null;
  const iv = randomBytes(GCM_IV_LEN);
  const cipher = createCipheriv(CIPHER, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

function decryptApiKeyCiphertext(blob: string): string | null {
  const key = apiKeyEncryptionKey();
  if (!key) return null;
  try {
    const buf = Buffer.from(blob, "base64url");
    if (buf.length < GCM_IV_LEN + GCM_TAG_LEN + 1) return null;
    const iv = buf.subarray(0, GCM_IV_LEN);
    const tag = buf.subarray(GCM_IV_LEN, GCM_IV_LEN + GCM_TAG_LEN);
    const data = buf.subarray(GCM_IV_LEN + GCM_TAG_LEN);
    const decipher = createDecipheriv(CIPHER, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      "utf8",
    );
  } catch {
    return null;
  }
}

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
      projection: {
        _id: 1,
        label: 1,
        keyPrefix: 1,
        createdAt: 1,
        signInDomain: 1,
        signInLogoUrl: 1,
        keyCiphertext: 1,
      },
    })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((d) => ({
    id: d._id.toHexString(),
    label: d.label,
    keyPrefix: d.keyPrefix,
    createdAt: d.createdAt.toISOString(),
    signInDomain: d.signInDomain ?? null,
    signInLogoUrl: d.signInLogoUrl ?? null,
    canReveal: Boolean(
      typeof d.keyCiphertext === "string" && d.keyCiphertext.length > 0,
    ),
  }));
}

export type CreateApiKeyResult =
  | { ok: true; plaintextKey: string; id: string }
  | { ok: false; error: string };

export type CreateApiKeyOptions = {
  signInDomain?: string;
  signInLogoUrl?: string;
};

export async function createApiKey(
  ownerAccountId: ObjectId | null,
  ownerEmail: string,
  label: string,
  options?: CreateApiKeyOptions,
): Promise<CreateApiKeyResult> {
  const coll = await getCollection<ApiKeyRecord>(API_KEYS_COLLECTION);
  if (!coll) {
    return { ok: false, error: "Database is not configured." };
  }

  const trimmedLabel = label.trim().slice(0, 120);
  if (!trimmedLabel) {
    return { ok: false, error: "Enter a label for this key." };
  }

  const domainParsed = parseSignInDomainInput(options?.signInDomain ?? "");
  if (domainParsed === "invalid") {
    return {
      ok: false,
      error:
        "Sign-in domain looks invalid. Use a hostname such as app.example.com (you may paste a full https URL — we store the host only).",
    };
  }
  const logoParsed = parseSignInLogoUrlInput(options?.signInLogoUrl ?? "");
  if (logoParsed === "invalid") {
    return {
      ok: false,
      error:
        "Sign-in logo must be a valid https:// image URL (or leave it blank).",
    };
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
  if (domainParsed) doc.signInDomain = domainParsed;
  if (logoParsed) doc.signInLogoUrl = logoParsed;

  const enc = encryptApiKeyPlaintext(plaintextKey);
  if (enc) {
    doc.keyCiphertext = enc;
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

export type RevealApiKeyResult =
  | { ok: true; plaintextKey: string }
  | { ok: false; error: string };

export async function revealApiKeyPlaintext(
  ownerAccountId: ObjectId | null,
  ownerEmail: string,
  keyId: string,
): Promise<RevealApiKeyResult> {
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
  const doc = await coll.findOne(revokeKeyFilter(oid, ownerAccountId, norm), {
    projection: { keyCiphertext: 1 },
  });
  if (!doc) {
    return { ok: false, error: "Key not found or already revoked." };
  }
  const ct = doc.keyCiphertext;
  if (typeof ct !== "string" || !ct.trim()) {
    return {
      ok: false,
      error:
        "This key has no encrypted secret on file (usually created before reveal support). Create a new key to use reveal and copy later.",
    };
  }
  const plain = decryptApiKeyCiphertext(ct);
  if (!plain) {
    return {
      ok: false,
      error:
        "Could not decrypt this key (server secret may have changed). Create a new key.",
    };
  }
  return { ok: true, plaintextKey: plain };
}

export async function updateApiKeySignInMetadata(
  ownerAccountId: ObjectId | null,
  ownerEmail: string,
  keyId: string,
  signInDomainRaw: string,
  signInLogoUrlRaw: string,
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

  const domainParsed = parseSignInDomainInput(signInDomainRaw);
  if (domainParsed === "invalid") {
    return {
      ok: false,
      error:
        "Sign-in domain looks invalid. Use a hostname such as app.example.com.",
    };
  }
  const logoParsed = parseSignInLogoUrlInput(signInLogoUrlRaw);
  if (logoParsed === "invalid") {
    return {
      ok: false,
      error: "Sign-in logo must be a valid https:// URL or left blank.",
    };
  }

  const norm = ownerEmail.trim().toLowerCase();
  const filter = revokeKeyFilter(oid, ownerAccountId, norm);

  const $set: Record<string, string> = {};
  const $unset: Record<string, ""> = {};
  if (domainParsed) $set.signInDomain = domainParsed;
  else $unset.signInDomain = "";
  if (logoParsed) $set.signInLogoUrl = logoParsed;
  else $unset.signInLogoUrl = "";

  const update: { $set?: Record<string, string>; $unset?: Record<string, ""> } =
    {};
  if (Object.keys($set).length > 0) update.$set = $set;
  if (Object.keys($unset).length > 0) update.$unset = $unset;

  const res = await coll.updateOne(filter, update);
  if (res.matchedCount === 0) {
    return { ok: false, error: "Key not found or already revoked." };
  }
  return { ok: true };
}
