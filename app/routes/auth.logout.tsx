import { redirect } from "react-router";

import type { Route } from "./+types/auth.logout";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import {
  serializePortalSessionClearCookie,
  serializeSsoSnapshotClearCookie,
} from "~/lib/portal-session.server";
import { destroyPortalSession, getPortalSession } from "~/sessions.server";

export function loader({ request }: Route.LoaderArgs) {
  const locale = resolveLocaleFromRequest(request);
  return redirect(withLocalePrefix("/account/login", locale));
}

/**
 * POST: destroys the signed portal session cookie and clears legacy cookies.
 */
export async function action({ request }: Route.ActionArgs) {
  const session = await getPortalSession(request.headers.get("Cookie"));
  const headers = new Headers();
  headers.append("Set-Cookie", await destroyPortalSession(request, session));
  headers.append("Set-Cookie", serializePortalSessionClearCookie(request));
  headers.append("Set-Cookie", serializeSsoSnapshotClearCookie(request));
  return new Response(null, { status: 204, headers });
}

export default function AuthLogout() {
  return null;
}
