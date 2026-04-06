import { createHmac, timingSafeEqual } from "node:crypto";

import { ObjectId } from "mongodb";

export const PORTAL_SESSION_COOKIE = "inta_portal_sess";

/** 30 days */
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

export function signPortalSessionToken(accountId: ObjectId): string | null {
  const sec = sessionSecret();
  if (!sec) return null;
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const hexId = accountId.toHexString();
  const payload = `${hexId}.${exp}`;
  const sig = createHmac("sha256", sec).update(payload).digest("base64url");
  return `${payload}.${sig}`;
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

/** `Set-Cookie` value for a new portal session (HttpOnly). */
export function serializePortalSessionSetCookie(
  request: Request,
  accountId: ObjectId,
): string | null {
  const token = signPortalSessionToken(accountId);
  if (!token) return null;
  const secure = requestIsHttps(request);
  const attrs = [
    `${PORTAL_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${MAX_AGE_SEC}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

/** `Set-Cookie` to clear the portal session. */
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
