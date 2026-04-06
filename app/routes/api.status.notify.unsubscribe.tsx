import { redirect } from "react-router";

import type { Route } from "./+types/api.status.notify.unsubscribe";
import { deleteStatusSubscriptionByUnsubscribeToken } from "~/lib/status-notify-subscriptions.server";

/** GET: one-click unsubscribe from status emails. */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return redirect("/status?notify=unsub_missing");
  }
  const ok = await deleteStatusSubscriptionByUnsubscribeToken(token);
  return redirect(
    ok ? "/status?notify=unsubscribed" : "/status?notify=unsub_invalid",
  );
}
