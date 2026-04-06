/**
 * Profile shape used to upsert `user_accounts` and fill the signed portal cookie.
 * Intastellar identity is established by the SDK; this app trusts `account.user` from
 * `loginCallback` / `getUsers()` when minting the server session (no token verify here).
 */
export type PortalAccountSession = {
  email: string;
  displayName: string;
  imageUrl?: string;
};

const MAX_EMAIL = 320;
const MAX_DISPLAY = 200;
const MAX_IMAGE_URL = 2000;

/** Parse `IntastellarUser`-shaped JSON from `POST /auth/session`. */
export function portalSessionFromIntastellarUserJson(
  raw: unknown,
): PortalAccountSession | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const emailRaw = o.email;
  if (typeof emailRaw !== "string" || !emailRaw.trim()) return null;
  const email = emailRaw.trim().toLowerCase().slice(0, MAX_EMAIL);
  if (!email) return null;

  let first = "";
  let last = "";
  const name = o.name;
  if (name && typeof name === "object") {
    const n = name as Record<string, unknown>;
    first = typeof n.first === "string" ? n.first.slice(0, 120) : "";
    last = typeof n.last === "string" ? n.last.slice(0, 120) : "";
  }
  const displayName =
    `${first} ${last}`.trim().slice(0, MAX_DISPLAY) || email;

  const img = o.image;
  const imageUrl =
    typeof img === "string" && img.trim()
      ? img.trim().slice(0, MAX_IMAGE_URL)
      : undefined;

  return { email, displayName, imageUrl };
}
