import { intastellarDisplayNameFromSessionUserJson } from "./intastellar-user-display";

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

  const displayName = intastellarDisplayNameFromSessionUserJson(o).slice(
    0,
    MAX_DISPLAY,
  );

  const img = o.image;
  const imageUrl =
    typeof img === "string" && img.trim()
      ? img.trim().slice(0, MAX_IMAGE_URL)
      : undefined;

  return {
    email,
    displayName: displayName || email.slice(0, MAX_DISPLAY),
    imageUrl,
  };
}
