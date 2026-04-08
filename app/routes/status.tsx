import { useState } from "react";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/status";
import { StatusIncidentLog } from "~/components/status-incident-log";
import { StatusManualIncidents } from "~/components/status-manual-incidents";
import {
  StatusDeploySection,
  StatusMaintenanceSection,
  StatusTrustSection,
} from "~/components/status-page-extras";
import { StatusSubscribeSection } from "~/components/status-subscribe-section";
import { StatusUptimeBadgeModal } from "~/components/status-uptime-badge-modal";
import { StatusLatencyTrend } from "~/components/status-latency-trend";
import { StatusMonitorTimeline } from "~/components/status-monitor-timeline";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { interpolate, translatePath } from "~/lib/i18n/messages";
import {
  buildStatusPageCopyTemplates,
  finalizeStatusPageCopy,
  resolveStatusPageCopy,
} from "~/lib/status-page-copy";
import { isMongoConfigured } from "~/lib/mongodb.server";
import {
  formatDateTimeMediumUtc,
  formatDateTimeShortUtc,
} from "~/lib/format-datetime";
import {
  getRecentStatusIncidentsByTarget,
  getStatusHistoryMaxRowsCap,
  getStatusHistoryWindowHours,
  getStatusTimelines,
  getStoredOverallUptime,
  type StatusIncident,
  type StatusTimelinePoint,
} from "~/lib/status-history.server";
import { overallOk, runStatusProbes } from "~/lib/status-probe.server";
import { getLatestStatusSnapshot } from "~/lib/status-snapshot.server";
import { getStatusDeployPublic } from "~/lib/status-deploy.server";
import { listFutureMaintenanceWindowsFromMongo } from "~/lib/status-maintenance-db.server";
import { getPublicMaintenanceWindows } from "~/lib/status-maintenance.server";
import { listManualIncidentsPublic } from "~/lib/status-manual-incidents.server";
import { isStatusEmailConfigured } from "~/lib/status-notify-email.server";
import { absoluteUrl } from "~/lib/site";
import {
  uptimePercentHeadlineClass,
  uptimePercentTier,
} from "~/lib/status-uptime-tier";
import { getStatusTargets } from "~/lib/status-targets.server";

const NOTIFY_FLASH = new Set([
  "verified",
  "unsubscribed",
  "verify_missing",
  "verify_invalid",
  "unsub_missing",
  "unsub_invalid",
]);

export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveLocaleFromRequest(request);
  const reqUrl = new URL(request.url);
  const notifyParam = reqUrl.searchParams.get("notify") ?? "";
  const notifyFlash = NOTIFY_FLASH.has(notifyParam)
    ? (notifyParam as
        | "verified"
        | "unsubscribed"
        | "verify_missing"
        | "verify_invalid"
        | "unsub_missing"
        | "unsub_invalid")
    : null;
  const targetList = getStatusTargets();
  const targetNames = Object.fromEntries(
    targetList.map((t) => [t.id, t.name] as const),
  );

  let snapshot = await getLatestStatusSnapshot();
  let source: "mongodb" | "live" | "none" = snapshot ? "mongodb" : "none";

  if (!snapshot && process.env.NODE_ENV !== "production") {
    const results = await runStatusProbes(targetList);
    snapshot = {
      checkedAt: new Date().toISOString(),
      overallOk: overallOk(results),
      results,
    };
    source = "live";
  }

  const timelines: Record<string, StatusTimelinePoint[]> = {};
  let incidentsByTarget: Record<string, StatusIncident[]> = {};
  let monitorOrder: string[] = [];
  let checkedAtLabel: string | null = null;
  const historyWindowHours = getStatusHistoryWindowHours();
  const historyMaxRowsCap = getStatusHistoryMaxRowsCap();
  const mongoConfigured = isMongoConfigured();
  const subscribeEmailAvailable =
    mongoConfigured && isStatusEmailConfigured();
  const [mongoMaint, deploy, manualIncidents] = await Promise.all([
    mongoConfigured ? listFutureMaintenanceWindowsFromMongo() : Promise.resolve([]),
    getStatusDeployPublic(),
    mongoConfigured ? listManualIncidentsPublic(25) : Promise.resolve([]),
  ]);
  const maintenance = getPublicMaintenanceWindows(
    formatDateTimeMediumUtc,
    { mongoWindows: mongoMaint },
  );

  type UptimePayload =
    | {
        variant: "stored";
        percent: number;
        totalRuns: number;
        passedRuns: number;
      }
    | { variant: "dev"; percent: number };
  let uptime: UptimePayload | null = null;
  let uptimeNarrativeHours = historyWindowHours;

  if (snapshot) {
    checkedAtLabel = formatDateTimeMediumUtc(snapshot.checkedAt);
    monitorOrder = snapshot.results.map((r) => r.id);
    const ids = monitorOrder;
    if (source === "mongodb") {
      Object.assign(timelines, await getStatusTimelines(ids));
      incidentsByTarget = await getRecentStatusIncidentsByTarget(ids, 25);
      const u = await getStoredOverallUptime();
      if (u) {
        uptimeNarrativeHours = u.displayWindowHours;
        uptime = {
          variant: "stored",
          percent: u.percent,
          totalRuns: u.totalRuns,
          passedRuns: u.passedRuns,
        };
      }
    } else {
      const iso = snapshot.checkedAt;
      const tip = formatDateTimeShortUtc(iso);
      for (const r of snapshot.results) {
        timelines[r.id] = [
          {
            ok: r.ok,
            segmentKind: r.ok ? "up" : "probe_down",
            checkedAt: iso,
            checkedAtLabel: tip,
            latencyMs: r.latencyMs,
          },
        ];
      }
      uptime = {
        variant: "dev",
        percent: snapshot.overallOk ? 100 : 0,
      };
    }
  }

  const copy = finalizeStatusPageCopy(
    buildStatusPageCopyTemplates(locale),
    historyWindowHours,
    historyMaxRowsCap,
    locale,
    { uptimeNarrativeHours },
  );

  const incidentLogHasEntries = Object.values(incidentsByTarget).some(
    (rows) => rows.length > 0,
  );

  return {
    locale,
    copy,
    snapshot,
    source,
    mongoConfigured,
    timelines,
    checkedAtLabel,
    incidentsByTarget,
    monitorOrder,
    incidentLogHasEntries,
    targetNames,
    uptime,
    maintenance,
    deploy,
    manualIncidents,
    feedUrl: absoluteUrl("/api/status/feed.xml"),
    notifyFlash,
    subscribeEmailAvailable,
  };
}

export function meta({ data, loaderData }: Route.MetaArgs) {
  const payload = loaderData ?? data;
  const locale = payload?.locale ?? "en";
  const feedHref = absoluteUrl("/api/status/feed.xml");
  return [
    { title: translatePath(locale, "status.metaTitle") },
    {
      name: "description",
      content: translatePath(locale, "status.metaDescription"),
    },
    {
      tagName: "link",
      rel: "alternate",
      type: "application/rss+xml",
      title: translatePath(locale, "status.subscribeRssTitle"),
      href: feedHref,
    },
  ];
}

export default function StatusPage() {
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const {
    locale,
    copy: copyFromLoader,
    snapshot,
    source,
    mongoConfigured,
    timelines,
    checkedAtLabel,
    incidentsByTarget,
    monitorOrder,
    incidentLogHasEntries,
    targetNames,
    uptime,
    maintenance,
    deploy,
    manualIncidents,
    feedUrl,
    notifyFlash,
    subscribeEmailAvailable,
  } = useLoaderData<typeof loader>();
  const copy = resolveStatusPageCopy(locale, copyFromLoader);

  const notifyFlashMessage =
    notifyFlash === "verified"
      ? copy.notifyFlashVerified
      : notifyFlash === "unsubscribed"
        ? copy.notifyFlashUnsubscribed
        : notifyFlash === "verify_missing"
          ? copy.notifyFlashVerifyMissing
          : notifyFlash === "verify_invalid"
            ? copy.notifyFlashVerifyInvalid
            : notifyFlash === "unsub_missing"
              ? copy.notifyFlashUnsubMissing
              : notifyFlash === "unsub_invalid"
                ? copy.notifyFlashUnsubInvalid
                : null;

  const hasManualNotices = manualIncidents.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:max-w-6xl">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {copy.heading}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {copy.introBeforeLink}{" "}
        <a
          href="/api/status.json"
          className="text-brand hover:text-brand-hover"
        >
          /api/status.json
        </a>
        {copy.introAfterLink}
      </p>

      {notifyFlashMessage ? (
        <p
          className={
            notifyFlash === "verified" || notifyFlash === "unsubscribed"
              ? "mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
              : "mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          }
          role="status"
        >
          {notifyFlashMessage}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8 *:min-w-0 [&>section]:mt-0">
        <StatusTrustSection copy={copy} />
        <StatusSubscribeSection
          copy={copy}
          feedUrl={feedUrl}
          subscribeEmailAvailable={subscribeEmailAvailable}
        />
        <StatusMaintenanceSection copy={copy} windows={maintenance} />
        <StatusDeploySection copy={copy} deploy={deploy} />
      </div>

      <div className="mt-8 grid gap-6 lg:gap-8">
        <div className="min-w-0 space-y-4">
          {uptime?.variant === "stored" ? (
            <div
              className="rounded-xl border border-zinc-200 bg-zinc-50/90 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900/50"
              aria-label={copy.ariaUptimeStored}
            >
              <p
                className={`text-4xl font-semibold tabular-nums tracking-tight ${uptimePercentHeadlineClass[uptimePercentTier(uptime.percent)]}`}
              >
                {uptime.percent % 1 === 0
                  ? `${uptime.percent.toFixed(0)}%`
                  : `${uptime.percent.toFixed(1)}%`}{" "}
                <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                  {copy.uptimeWord}
                </span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {copy.uptimeStoredRunsBefore}{" "}
                <strong className="font-medium text-zinc-700 dark:text-zinc-300">
                  {uptime.totalRuns}
                </strong>{" "}
                {copy.uptimeStoredRunsMid}{" "}
                <strong className="font-medium text-zinc-700 dark:text-zinc-300">
                  {uptime.passedRuns}
                </strong>{" "}
                {copy.uptimeStoredRunsAfter}
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setEmbedModalOpen(true)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  {copy.embedBadgeButton}
                </button>
              </div>
            </div>
          ) : uptime?.variant === "dev" ? (
            <div
              className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-950/30"
              aria-label={copy.ariaUptimeDev}
            >
              <p
                className={`text-3xl font-semibold tabular-nums tracking-tight ${uptimePercentHeadlineClass[uptimePercentTier(uptime.percent)]}`}
              >
                {uptime.percent}%{" "}
                <span className="text-base font-medium text-amber-900/80 dark:text-amber-200/80">
                  {copy.onThisPageLoad}
                </span>
              </p>
              <p className="mt-2 text-xs text-amber-900/90 dark:text-amber-100/70">
                {copy.devUptimeNote}
              </p>
            </div>
          ) : snapshot && source === "mongodb" ? (
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
              {copy.uptimePending}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-4">
          {source === "live" ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
              {copy.devLiveProbeBefore}{" "}
              <strong>{copy.devLiveProbeStrong}</strong>{" "}
              {copy.devLiveProbeAfter}
            </p>
          ) : null}

          {!snapshot && source === "none" ? (
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
              {mongoConfigured ? copy.noSnapshotCron : copy.noSnapshotMongo}
            </p>
          ) : null}

          {snapshot ? (
            <div className="flex flex-wrap items-center gap-3 lg:pt-1">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                  snapshot.overallOk
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                    : "bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-200"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    snapshot.overallOk ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  aria-hidden
                />
                {snapshot.overallOk
                  ? copy.allChecksPassing
                  : copy.someChecksFailing}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {copy.updated} {checkedAtLabel}
                {source === "mongodb" ? copy.storedUtc : copy.utcOnly}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {snapshot ? (
        <>
          <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-700">
            {snapshot.results.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {r.name}
                    </p>
                    <p className="mt-0.5 break-all text-xs text-zinc-500 dark:text-zinc-400">
                      {r.url}
                    </p>
                    {r.error ? (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {r.error}
                      </p>
                    ) : null}
                    <StatusMonitorTimeline
                      points={timelines[r.id] ?? []}
                      liveSingleCheck={source === "live"}
                      copy={copy}
                    />
                    <StatusLatencyTrend
                      points={timelines[r.id] ?? []}
                      label={r.name}
                      copy={copy}
                    />
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end sm:pt-0.5">
                    <span
                      className={
                        r.ok
                          ? "text-sm font-medium text-emerald-600 dark:text-emerald-400"
                          : "text-sm font-medium text-red-600 dark:text-red-400"
                      }
                    >
                      {r.statusCode != null
                        ? interpolate(copy.httpStatus, {
                            code: r.statusCode,
                          })
                        : copy.noResponse}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {r.latencyMs} ms
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start *:min-w-0">
            {hasManualNotices ? (
              <div className="[&>section]:mt-0">
                <StatusManualIncidents incidents={manualIncidents} copy={copy} />
              </div>
            ) : null}
            <div
              className={`[&>section]:mt-0${!hasManualNotices ? " lg:col-span-2" : ""}`}
            >
              <StatusIncidentLog
                incidentLogHasEntries={incidentLogHasEntries}
                incidentsByTarget={incidentsByTarget}
                monitorOrder={monitorOrder}
                targetNames={targetNames}
                copy={copy}
              />
            </div>
          </div>
        </>
      ) : (
        <StatusManualIncidents incidents={manualIncidents} copy={copy} />
      )}

      <StatusUptimeBadgeModal
        open={embedModalOpen}
        onClose={() => setEmbedModalOpen(false)}
        copy={copy}
        locale={locale}
      />

      <footer
        className="mt-12 border-t border-zinc-200 pt-6 dark:border-zinc-700"
        role="note"
        aria-label={copy.footnoteAria}
      >
        <p
          id="status-page-footnote-label"
          className="text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
        >
          {copy.footnoteTitle}
        </p>
        <div
          className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
          aria-labelledby="status-page-footnote-label"
        >
          <p>
            {copy.footnoteP1Before}{" "}
            <strong className="font-medium text-zinc-600 dark:text-zinc-300">
              {copy.footnoteP1Strong}
            </strong>{" "}
            {copy.footnoteP1After}
          </p>
          <p className="mt-2">
            {copy.footnoteP2a}{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-[0.7rem] dark:bg-zinc-800">
              STATUS_CHECK_TARGETS_JSON
            </code>{" "}
            {copy.footnoteP2b}{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-[0.7rem] dark:bg-zinc-800">
              STATUS_CHECK_EXTRA_JSON
            </code>{" "}
            {copy.footnoteP2c}{" "}
            {copy.footnoteP2d}{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-[0.7rem] dark:bg-zinc-800">
              latencyMs
            </code>
            {copy.footnoteP2e}
          </p>
        </div>
      </footer>
    </div>
  );
}
