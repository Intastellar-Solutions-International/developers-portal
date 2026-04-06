import { createHmac, timingSafeEqual } from "node:crypto";

import { ObjectId } from "mongodb";

/** Legacy signed cookie (pre–React Router session); cleared on login / logout. */
export const PORTAL_SESSION_COOKIE = "inta_portal_sess";

/** Legacy SSO snapshot cookie; cleared when migrating to `inta_portal_session`. */
export const PORTAL_SSO_SNAPSHOT_COOKIE = "inta_portal_sso";

/** 30 days — must match verification logic for legacy tokens. */
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

function sessionSecret(): Buffer | null {
  const s = process.env.SESSION_SECRET?.trim();
  if (!s) {
    if (process.env.NODE_ENV === "production") return null;
    return Buffer.from("dev-inta-portal-session-secret-change-me", "utf8");
  }
  return Buffer.from(s, "utf8");
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const nameLower = name.toLowerCase();
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k.toLowerCase() !== nameLower) continue;
    const v = part.slice(idx + 1).trim();
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }
  return null;
}

export function readPortalSessionTokenFromRequest(request: Request): string | null {
  const raw = parseCookie(request.headers.get("Cookie"), PORTAL_SESSION_COOKIE);
  const t = raw?.trim();
  return t || null;
}

export type SsoSnapshotSession = {
  email: string;
  displayName: string;
  imageUrl?: string;
};

export function verifySsoSnapshotToken(token: string): SsoSnapshotSession | null {
  const sec = sessionSecret();
  if (!sec) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [b64, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  const payload = `${b64}.${expStr}`;
  const expected = createHmac("sha256", sec).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  let inner: { v?: number; email?: string; displayName?: string; imageUrl?: string };
  try {
    inner = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as typeof inner;
  } catch {
    return null;
  }
  if (inner.v !== 1) return null;
  const email =
    typeof inner.email === "string" ? inner.email.trim().toLowerCase() : "";
  if (!email) return null;
  const displayName =
    typeof inner.displayName === "string" && inner.displayName.trim()
      ? inner.displayName.trim()
      : email;
  const imageUrl =
    typeof inner.imageUrl === "string" && inner.imageUrl.trim()
      ? inner.imageUrl.trim()
      : undefined;
  return { email, displayName, imageUrl };
}

export function readSsoSnapshotTokenFromRequest(request: Request): string | null {
  const raw = parseCookie(request.headers.get("Cookie"), PORTAL_SSO_SNAPSHOT_COOKIE);
  const t = raw?.trim();
  return t || null;
}

export function verifyPortalSessionToken(token: string): ObjectId | null {
  const sec = sessionSecret();
  if (!sec) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [hexId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  let oid: ObjectId;
  try {
    oid = new ObjectId(hexId);
  } catch {
    return null;
  }
  const payload = `${hexId}.${expStr}`;
  const expected = createHmac("sha256", sec).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length) {
    return null;
  }
  if (!timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  return oid;
}

function requestIsHttps(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim().toLowerCase();
    if (first === "https") return true;
    if (first === "http") return false;
  }
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Expire legacy `inta_portal_sess`. */
export function serializePortalSessionClearCookie(request: Request): string {
  const secure = requestIsHttps(request);
  const attrs = [
    `${PORTAL_SESSION_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

/** Expire legacy `inta_portal_sso`. */
export function serializeSsoSnapshotClearCookie(request: Request): string {
  const secure = requestIsHttps(request);
  const attrs = [
    `${PORTAL_SSO_SNAPSHOT_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}
