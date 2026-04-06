import { formatDateTimeMediumUtc } from "~/lib/format-datetime";
import { labelsForTargetIds } from "~/lib/status-affected-targets";
import {
  isStatusEmailConfigured,
  sendIncidentAlertEmail,
  sendMaintenanceAlertEmail,
} from "~/lib/status-notify-email.server";
import { listVerifiedSubscribersForTopic } from "~/lib/status-notify-subscriptions.server";
import { getStatusTargets } from "~/lib/status-targets.server";

function monitorsLine(labels: string[]): string | null {
  if (!labels.length) return null;
  return `Monitors: ${labels.join(", ")}`;
}

/** Fire-and-forget safe: logs failures, does not throw to callers. */
export async function notifySubscribersNewMaintenance(payload: {
  title: string;
  summary?: string;
  startsAt: string;
  endsAt: string;
  affectedTargetIds?: string[];
}): Promise<void> {
  if (!isStatusEmailConfigured()) return;
  try {
    const subs = await listVerifiedSubscribersForTopic("maintenance");
    if (!subs.length) return;
    const targets = getStatusTargets();
    const labels = labelsForTargetIds(payload.affectedTargetIds, targets);
    const startsAtLabel = formatDateTimeMediumUtc(payload.startsAt);
    const endsAtLabel = formatDateTimeMediumUtc(payload.endsAt);
    const line = monitorsLine(labels);
    for (const s of subs) {
      const r = await sendMaintenanceAlertEmail({
        to: s.email,
        unsubscribeToken: s.unsubscribeToken,
        title: payload.title,
        summary: payload.summary,
        startsAtLabel,
        endsAtLabel,
        monitorsLine: line,
      });
      if (!r.ok && process.env.NODE_ENV !== "production") {
        console.warn("[status-notify] maintenance email failed:", s.email, r);
      }
    }
  } catch (e) {
    console.warn("[status-notify] notifySubscribersNewMaintenance:", e);
  }
}

export async function notifySubscribersNewIncident(payload: {
  title: string;
  body: string;
  severity: string;
  affectedTargetIds?: string[];
}): Promise<void> {
  if (!isStatusEmailConfigured()) return;
  try {
    const subs = await listVerifiedSubscribersForTopic("incidents");
    if (!subs.length) return;
    const targets = getStatusTargets();
    const labels = labelsForTargetIds(payload.affectedTargetIds, targets);
    const line = monitorsLine(labels);
    for (const s of subs) {
      const r = await sendIncidentAlertEmail({
        to: s.email,
        unsubscribeToken: s.unsubscribeToken,
        severity: payload.severity,
        title: payload.title,
        body: payload.body,
        monitorsLine: line,
      });
      if (!r.ok && process.env.NODE_ENV !== "production") {
        console.warn("[status-notify] incident email failed:", s.email, r);
      }
    }
  } catch (e) {
    console.warn("[status-notify] notifySubscribersNewIncident:", e);
  }
}
