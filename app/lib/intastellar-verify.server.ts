const INTA_ACC_COOKIE = "inta_acc";
const VERIFY_URL = "https://apis.intastellaraccounts.com/verify";

export type PortalAccountSession = {
  email: string;
  displayName: string;
};

function cookieValue(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k !== name) continue;
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
      account?: {
        user: {
          email?: string;
          name?: { first?: string; last?: string };
        };
      };
    };
    if (result.statusCode !== 200 || !result.account?.user) return null;
    const u = result.account.user;
    const email =
      typeof u.email === "string" ? u.email.trim().toLowerCase() : "";
    if (!email) return null;
    const first = u.name?.first ?? "";
    const last = u.name?.last ?? "";
    const displayName = `${first} ${last}`.trim() || email;
    return { email, displayName };
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
