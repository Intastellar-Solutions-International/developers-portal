import { data } from "react-router";

import type { Route } from "./+types/auth.session";
import { verifyIntastellarToken } from "~/lib/intastellar-verify.server";
import { isMongoConfigured } from "~/lib/mongodb.server";
import {
  serializePortalSessionSetCookie,
  serializeSsoSnapshotClearCookie,
  serializeSsoSnapshotSetCookie,
} from "~/lib/portal-session.server";
import { ensureUserFromIntastellar } from "~/lib/user-accounts.server";

export function loader() {
  return new Response(null, { status: 404 });
}

/**
 * POST JSON `{ "token": "<inta bearer>" }` — verifies with Intastellar, then when
 * MongoDB is configured issues HttpOnly `inta_portal_sess` so loaders see the user
 * without relying on the browser sending `inta_acc`.
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

  const session = await verifyIntastellarToken(token);
  if (!session) {
    return data({ ok: false as const, error: "verify_failed" }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    const snap = serializeSsoSnapshotSetCookie(request, {
      email: session.email,
      displayName: session.displayName,
      imageUrl: session.imageUrl,
    });
    if (!snap) {
      return data(
        { ok: false as const, error: "session_unconfigured" },
        { status: 503 },
      );
    }
    const headers = new Headers();
    headers.append("Set-Cookie", snap);
    return data({ ok: true as const }, { headers });
  }

  const accountId = await ensureUserFromIntastellar(session);
  if (!accountId) {
    const snap = serializeSsoSnapshotSetCookie(request, {
      email: session.email,
      displayName: session.displayName,
      imageUrl: session.imageUrl,
    });
    if (!snap) {
      return data({ ok: false as const, error: "db_unavailable" }, { status: 503 });
    }
    const headers = new Headers();
    headers.append("Set-Cookie", snap);
    return data({ ok: true as const }, { headers });
  }

  const cookie = serializePortalSessionSetCookie(request, accountId);
  if (!cookie) {
    return data(
      { ok: false as const, error: "session_unconfigured" },
      { status: 503 },
    );
  }

  const headers = new Headers();
  headers.append("Set-Cookie", cookie);
  headers.append("Set-Cookie", serializeSsoSnapshotClearCookie(request));
  return data({ ok: true as const }, { headers });
}

export default function AuthSession() {
  return null;
}
