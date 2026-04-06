import { data } from "react-router";

import type { Route } from "./+types/api.status.subscribe";
import { sendStatusVerifyEmail } from "~/lib/status-notify-email.server";
import { requestStatusEmailSubscription } from "~/lib/status-notify-subscriptions.server";

function parseBool(v: FormDataEntryValue | null): boolean {
  if (v == null) return false;
  const s = String(v).toLowerCase().trim();
  if (s === "0" || s === "false" || s === "") return false;
  return s === "1" || s === "true" || s === "on" || s === "yes";
}

/** POST: request email subscription (double opt-in) for maintenance and/or operator notices. */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return data({ ok: false, error: "Method not allowed" }, { status: 405 });
  }
  const fd = await request.formData();
  const email = String(fd.get("email") ?? "").trim();
  const notifyMaintenance = parseBool(fd.get("notifyMaintenance"));
  const notifyIncidents = parseBool(fd.get("notifyIncidents"));
  const sub = await requestStatusEmailSubscription({
    email,
    notifyMaintenance,
    notifyIncidents,
  });
  if (!sub.ok) {
    return data({ ok: false, error: sub.error }, { status: 400 });
  }
  if (sub.kind === "updated") {
    return data({ ok: true, kind: "updated" as const });
  }
  const sent = await sendStatusVerifyEmail(email, sub.verifyToken);
  if (!sent.ok) {
    return data(
      { ok: false, error: "Could not send confirmation email. Try again later." },
      { status: 502 },
    );
  }
  return data({ ok: true, kind: "verify_sent" as const });
}
