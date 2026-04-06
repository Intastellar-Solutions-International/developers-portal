const INTA_ACC_COOKIE = "inta_acc";
const VERIFY_URL = "https://apis.intastellaraccounts.com/verify";

export type PortalAccountSession = {
  email: string;
  displayName: string;
  /** Profile photo URL (same field as SDK `getUsers()` → `image`). */
  imageUrl?: string;
};

/**
 * `/verify` may return `account.user` as an array or an object that carries
 * extra fields under numeric key `0` (see `@intastellar/signin-sdk-react` verifyToken).
 */
function normalizeIntastellarVerifyUser(raw: unknown): {
  email?: string;
  primaryEmail?: string;
  name?: { first?: string; last?: string };
  image?: string;
} | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const merged: Record<string, unknown> = {};
    for (const item of raw) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        Object.assign(merged, item as object);
      }
    }
    return merged as {
      email?: string;
      primaryEmail?: string;
      name?: { first?: string; last?: string };
      image?: string;
    };
  }
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...o };
  const slot0 = o["0"];
  if (slot0 && typeof slot0 === "object" && !Array.isArray(slot0)) {
    Object.assign(merged, slot0 as object);
  }
  delete merged["0"];
  return merged as {
    email?: string;
    primaryEmail?: string;
    name?: { first?: string; last?: string };
    image?: string;
  };
}

function cookieValue(header: string | null, name: string): string | null {
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

export function intaAccTokenFromRequest(request: Request): string | null {
  const raw = cookieValue(request.headers.get("Cookie"), INTA_ACC_COOKIE);
  const t = raw?.trim();
  return t || null;
}

/**
 * Validates the same bearer token stored in the `inta_acc` cookie (Intastellar SSO).
 */
export async function verifyIntastellarToken(
  token: string,
): Promise<PortalAccountSession | null> {
  try {
    const res = await fetch(VERIFY_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = (await res.json()) as {
      statusCode?: number;
      status?: number | string;
      account?: { user?: unknown };
    };
    if (!res.ok) return null;
    if (!result.account?.user) return null;
    const sc = result.statusCode ?? result.status;
    if (sc !== undefined && sc !== 200 && sc !== "200" && String(sc).toLowerCase() !== "ok") {
      return null;
    }
    const u = normalizeIntastellarVerifyUser(result.account.user);
    if (!u) return null;
    const rawEmail =
      (typeof u.email === "string" && u.email) ||
      (typeof u.primaryEmail === "string" && u.primaryEmail) ||
      "";
    const email = rawEmail.trim().toLowerCase();
    if (!email) return null;
    const first = u.name?.first ?? "";
    const last = u.name?.last ?? "";
    const displayName = `${first} ${last}`.trim() || email;
    const imageUrl =
      typeof u.image === "string" && u.image.trim() ? u.image.trim() : undefined;
    return { email, displayName, imageUrl };
  } catch {
    return null;
  }
}

export async function getPortalAccountSession(
  request: Request,
): Promise<PortalAccountSession | null> {
  const token = intaAccTokenFromRequest(request);
  if (!token) return null;
  return verifyIntastellarToken(token);
}
