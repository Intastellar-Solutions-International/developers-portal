import { formatDateTimeMediumUtc } from "~/lib/format-datetime";
import { labelsForTargetIds } from "~/lib/status-affected-targets";
import type { StatusProbeResult } from "~/lib/status-probe.server";
import type { ManualIncidentUpdateNotifyPayload } from "~/lib/status-manual-incidents";
import {
  getOpsNotificationEmails,
  isStatusEmailConfigured,
  sendIncidentAlertEmail,
  sendIncidentUpdateAlertEmail,
  sendMaintenanceAlertEmail,
  sendProbeFailureAlertEmail,
} from "~/lib/status-notify-email.server";
import { listVerifiedSubscribersForTopic } from "~/lib/status-notify-subscriptions.server";
import { getStatusTargets } from "~/lib/status-targets.server";

function monitorsLine(labels: string[]): string | null {
  if (!labels.length) return null;
  return `Monitors: ${labels.join(", ")}`;
}

type AlertRecipient = { email: string; unsubscribeToken: string | null };

/** Mongo subscribers first, then STATUS_NOTIFY_OPS_EMAILS, deduped by email. */
function mergeSubscriberAndOpsRecipients(
  subs: { email: string; unsubscribeToken: string }[],
  opsEmails: string[],
): AlertRecipient[] {
  const out: AlertRecipient[] = [];
  const seen = new Set<string>();
  for (const s of subs) {
    if (seen.has(s.email)) continue;
    seen.add(s.email);
    out.push({ email: s.email, unsubscribeToken: s.unsubscribeToken });
  }
  for (const email of opsEmails) {
    if (seen.has(email)) continue;
    seen.add(email);
    out.push({ email, unsubscribeToken: null });
  }
  return out;
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
    const recipients = mergeSubscriberAndOpsRecipients(
      subs,
      getOpsNotificationEmails(),
    );
    if (!recipients.length) return;
    const targets = getStatusTargets();
    const labels = labelsForTargetIds(payload.affectedTargetIds, targets);
    const startsAtLabel = formatDateTimeMediumUtc(payload.startsAt);
    const endsAtLabel = formatDateTimeMediumUtc(payload.endsAt);
    const line = monitorsLine(labels);
    for (const r of recipients) {
      const send = await sendMaintenanceAlertEmail({
        to: r.email,
        unsubscribeToken: r.unsubscribeToken,
        title: payload.title,
        summary: payload.summary,
        startsAtLabel,
        endsAtLabel,
        monitorsLine: line,
      });
      if (!send.ok) {
        console.warn("[status-notify] maintenance email failed:", r.email, send);
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
      if (!r.ok) {
        console.warn("[status-notify] incident email failed:", s.email, r);
      }
    }
  } catch (e) {
    console.warn("[status-notify] notifySubscribersNewIncident:", e);
  }
}

/** Same audience as a new operator notice: verified “incidents” subscribers only. */
export async function notifySubscribersIncidentUpdate(
  payload: ManualIncidentUpdateNotifyPayload,
): Promise<void> {
  if (!isStatusEmailConfigured()) return;
  try {
    const subs = await listVerifiedSubscribersForTopic("incidents");
    if (!subs.length) return;
    const targets = getStatusTargets();
    const labels = labelsForTargetIds(payload.affectedTargetIds, targets);
    const line = monitorsLine(labels);
    for (const s of subs) {
      const r = await sendIncidentUpdateAlertEmail({
        to: s.email,
        unsubscribeToken: s.unsubscribeToken,
        title: payload.title,
        body: payload.body,
        fromSeverity: payload.fromSeverity,
        toSeverity: payload.toSeverity,
        updateMessage: payload.updateMessage,
        monitorsLine: line,
      });
      if (!r.ok) {
        console.warn("[status-notify] incident update email failed:", s.email, r);
      }
    }
  } catch (e) {
    console.warn("[status-notify] notifySubscribersIncidentUpdate:", e);
  }
}

/**
 * When synthetic cron probes newly fail (ok → failing), email subscribers who opted into
 * **operator notices** — same list as manual incident posts; template says “automated monitoring”.
 */
export async function notifySubscribersNewProbeFailures(payload: {
  checkedAt: string;
  failures: StatusProbeResult[];
}): Promise<void> {
  if (!isStatusEmailConfigured() || payload.failures.length === 0) return;
  try {
    const subs = await listVerifiedSubscribersForTopic("incidents");
    const recipients = mergeSubscriberAndOpsRecipients(
      subs,
      getOpsNotificationEmails(),
    );
    if (!recipients.length) return;
    const checkedAtLabel = formatDateTimeMediumUtc(payload.checkedAt);
    const failures = payload.failures.map((f) => ({
      name: f.name,
      url: f.url,
      statusCode: f.statusCode,
      error: f.error,
      latencyMs: f.latencyMs,
    }));
    for (const r of recipients) {
      const send = await sendProbeFailureAlertEmail({
        to: r.email,
        unsubscribeToken: r.unsubscribeToken,
        checkedAtLabel,
        failures,
      });
      if (!send.ok) {
        console.warn("[status-notify] probe failure email failed:", r.email, send);
      }
    }
  } catch (e) {
    console.warn("[status-notify] notifySubscribersNewProbeFailures:", e);
  }
}
