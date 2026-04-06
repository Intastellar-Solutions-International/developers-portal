import { redirect } from "react-router";

import type { Route } from "./+types/auth.logout";
import {
  serializePortalSessionClearCookie,
  serializeSsoSnapshotClearCookie,
} from "~/lib/portal-session.server";

export function loader() {
  return redirect("/account/login");
}

/**
 * POST: clears HttpOnly portal session cookie. Call before SDK logout so the
 * browser can’t keep a valid `inta_portal_sess` after Intastellar signs out.
 */
export async function action({ request }: Route.ActionArgs) {
  const headers = new Headers();
  headers.append("Set-Cookie", serializePortalSessionClearCookie(request));
  headers.append("Set-Cookie", serializeSsoSnapshotClearCookie(request));
  return new Response(null, { status: 204, headers });
}

export default function AuthLogout() {
  return null;
}
