import { redirect } from "react-router";

import type { Route } from "./+types/api.status.notify.verify";
import { verifyStatusSubscriptionByToken } from "~/lib/status-notify-subscriptions.server";

/** GET: confirm email subscription (link from verification email). */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return redirect("/status?notify=verify_missing");
  }
  const ok = await verifyStatusSubscriptionByToken(token);
  if (!ok) {
    return redirect("/status?notify=verify_invalid");
  }
  return redirect("/status?notify=verified");
}
