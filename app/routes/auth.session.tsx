import { data } from "react-router";

import type { Route } from "./+types/auth.session";
import { portalSessionFromIntastellarUserJson } from "~/lib/intastellar-portal-session.server";
import { isMongoConfigured } from "~/lib/mongodb.server";
import {
  serializePortalSessionClearCookie,
  serializeSsoSnapshotClearCookie,
} from "~/lib/portal-session.server";
import { commitPortalSession, getPortalSession } from "~/sessions.server";
import { ensureUserFromIntastellar } from "~/lib/user-accounts.server";

export function loader() {
  return new Response(null, { status: 404 });
}

/**
 * POST JSON `{ "user": IntastellarUser }` from the SDK (`loginCallback` or synced `users[0]`).
 * No Intastellar token verification on this server — identity is taken from `user` and stored
 * in a signed HttpOnly session (https://reactrouter.com/explanation/sessions-and-cookies).
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return data({ ok: false as const, error: "invalid_json" }, { status: 400 });
  }

  const parsed = body as { user?: unknown };
  const portalProfile = portalSessionFromIntastellarUserJson(parsed.user);
  if (!portalProfile) {
    return data({ ok: false as const, error: "invalid_user" }, { status: 400 });
  }

  const portalSession = await getPortalSession(request.headers.get("Cookie"));
  portalSession.set("email", portalProfile.email);
  portalSession.set("displayName", portalProfile.displayName);
  if (portalProfile.imageUrl) {
    portalSession.set("avatarUrl", portalProfile.imageUrl);
  } else {
    portalSession.unset("avatarUrl");
  }

  const headers = new Headers();

  if (!isMongoConfigured()) {
    portalSession.unset("accountId");
    headers.append("Set-Cookie", await commitPortalSession(request, portalSession));
    headers.append("Set-Cookie", serializePortalSessionClearCookie(request));
    headers.append("Set-Cookie", serializeSsoSnapshotClearCookie(request));
    return data({ ok: true as const }, { headers });
  }

  const accountId = await ensureUserFromIntastellar(portalProfile);
  if (!accountId) {
    portalSession.unset("accountId");
    headers.append("Set-Cookie", await commitPortalSession(request, portalSession));
    headers.append("Set-Cookie", serializePortalSessionClearCookie(request));
    headers.append("Set-Cookie", serializeSsoSnapshotClearCookie(request));
    return data({ ok: true as const }, { headers });
  }

  portalSession.set("accountId", accountId.toHexString());
  headers.append("Set-Cookie", await commitPortalSession(request, portalSession));
  headers.append("Set-Cookie", serializePortalSessionClearCookie(request));
  headers.append("Set-Cookie", serializeSsoSnapshotClearCookie(request));
  return data({ ok: true as const }, { headers });
}

export default function AuthSession() {
  return null;
}
