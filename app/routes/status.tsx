import { useLoaderData } from "react-router";

import type { Route } from "./+types/status";
import { StatusIncidentLog } from "~/components/status-incident-log";
import { StatusLatencyTrend } from "~/components/status-latency-trend";
import { StatusMonitorTimeline } from "~/components/status-monitor-timeline";
import { isMongoConfigured } from "~/lib/mongodb.server";
import {
  formatDateTimeMediumUtc,
  formatDateTimeShortUtc,
} from "~/lib/format-datetime";
import {
  getRecentStatusIncidents,
  getStatusTimelines,
  type StatusIncident,
  type StatusTimelinePoint,
} from "~/lib/status-history.server";
import { overallOk, runStatusProbes } from "~/lib/status-probe.server";
import { getLatestStatusSnapshot } from "~/lib/status-snapshot.server";
import { getStatusTargets } from "~/lib/status-targets.server";

export async function loader(_: Route.LoaderArgs) {
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
  let incidents: StatusIncident[] = [];
  let checkedAtLabel: string | null = null;

  if (snapshot) {
    checkedAtLabel = formatDateTimeMediumUtc(snapshot.checkedAt);
    const ids = snapshot.results.map((r) => r.id);
    if (source === "mongodb") {
      Object.assign(timelines, await getStatusTimelines(ids));
      incidents = await getRecentStatusIncidents(25);
    } else {
      const iso = snapshot.checkedAt;
      const tip = formatDateTimeShortUtc(iso);
      for (const r of snapshot.results) {
        timelines[r.id] = [
          {
            ok: r.ok,
            checkedAt: iso,
            checkedAtLabel: tip,
            latencyMs: r.latencyMs,
          },
        ];
      }
    }
  }

  return {
    snapshot,
    source,
    mongoConfigured: isMongoConfigured(),
    timelines,
    checkedAtLabel,
    incidents,
    targetNames,
  };
}

export function meta(_: Route.MetaArgs) {
  return [
    { title: "System status · inta.dev" },
    {
      name: "description",
      content:
        "Uptime checks for Intastellar public endpoints (Consents, CDN, inta.dev).",
    },
  ];
}

export default function StatusPage() {
  const {
    snapshot,
    source,
    mongoConfigured,
    timelines,
    checkedAtLabel,
    incidents,
    targetNames,
  } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        System status
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Automated HTTP checks from inta.dev. JSON:{" "}
        <a
          href="/api/status.json"
          className="text-brand hover:text-brand-hover"
        >
          /api/status.json
        </a>
        . Cron updates require{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          MONGODB_URI
        </code>{" "}
        and{" "}
        <a
          href="https://vercel.com/docs/cron-jobs"
          className="text-brand hover:text-brand-hover"
          target="_blank"
          rel="noreferrer noopener"
        >
          Vercel Cron
        </a>
        .
      </p>

      {source === "live" ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          Development mode: showing a <strong>live</strong> probe (not saved).
          Production uses the last snapshot written by the cron job.
        </p>
      ) : null}

      {!snapshot && source === "none" ? (
        <p className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
          {mongoConfigured
            ? "No snapshot yet. Trigger the cron route once (see Vercel Cron) or wait for the next scheduled run."
            : "MongoDB is not configured — snapshots are not stored. In development, this page runs checks on each load; set MONGODB_URI and CRON_SECRET on Vercel for production monitoring."}
        </p>
      ) : null}

      {snapshot ? (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-3">
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
              {snapshot.overallOk ? "All checks passing" : "Some checks failing"}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Updated {checkedAtLabel}
              {source === "mongodb" ? " (stored, UTC)" : " (UTC)"}
            </span>
          </div>

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
                    />
                    <StatusLatencyTrend
                      points={timelines[r.id] ?? []}
                      label={r.name}
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
                      {r.statusCode != null ? `HTTP ${r.statusCode}` : "No response"}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {r.latencyMs} ms
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <StatusIncidentLog incidents={incidents} targetNames={targetNames} />
        </>
      ) : null}

      <p className="mt-10 text-xs text-zinc-500 dark:text-zinc-500">
        Configure targets with{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          STATUS_CHECK_TARGETS_JSON
        </code>{" "}
        (full replace) or{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          STATUS_CHECK_EXTRA_JSON
        </code>{" "}
        (append). A check is “passing” when the response status is below 500.
        Timelines, the incident log, and latency trends use the last{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">STATUS_HISTORY_POINTS</code>{" "}
        stored runs (14-day TTL in Mongo). Display times are UTC. New cron rows include per-target{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">latencyMs</code>; older rows only
        contribute up/down segments until they age out.
      </p>
    </div>
  );
}
