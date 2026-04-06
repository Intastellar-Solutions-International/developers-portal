import { data } from "react-router";

import type { Route } from "./+types/auth.session";
import { verifyIntastellarToken } from "~/lib/intastellar-verify.server";
import { isMongoConfigured } from "~/lib/mongodb.server";
import {
  serializePortalSessionClearCookie,
  serializeSsoSnapshotClearCookie,
} from "~/lib/portal-session.server";
import {
  commitPortalSession,
  getPortalSession,
} from "~/sessions.server";
import { ensureUserFromIntastellar } from "~/lib/user-accounts.server";

export function loader() {
  return new Response(null, { status: 404 });
}

/**
 * POST JSON `{ "token": "<inta bearer>" }` — verifies with Intastellar, then commits a
 * signed cookie session (see https://reactrouter.com/explanation/sessions-and-cookies).
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  let token = "";
  try {
    const body = (await request.json()) as { token?: unknown };
    token = typeof body.token === "string" ? body.token.trim() : "";
  } catch {
    return data({ ok: false as const, error: "invalid_json" }, { status: 400 });
  }

  if (!token || token.length > 16_000) {
    return data({ ok: false as const, error: "bad_token" }, { status: 400 });
  }

  const verified = await verifyIntastellarToken(token);
  if (!verified) {
    return data({ ok: false as const, error: "verify_failed" }, { status: 401 });
  }

  const portalSession = await getPortalSession(request.headers.get("Cookie"));
  portalSession.set("email", verified.email);
  portalSession.set("displayName", verified.displayName);
  if (verified.imageUrl) {
    portalSession.set("avatarUrl", verified.imageUrl);
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

  const accountId = await ensureUserFromIntastellar(verified);
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
