import { timingSafeEqual } from "node:crypto";

import type { Route } from "./+types/api.status.cron";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { notifySubscribersNewProbeFailures } from "~/lib/status-notify-dispatch.server";
import { overallOk, runStatusProbes } from "~/lib/status-probe.server";
import {
  newlyFailingProbeResults,
  newlyFailingProbeResultsForRegion,
} from "~/lib/status-probe-new-failures.server";
import {
  parseProbeRegionFromRequest,
  probeRegionFromEnv,
} from "~/lib/status-probe-regions.server";
import { appendStatusHistoryRun } from "~/lib/status-history.server";
import {
  getLatestStatusSnapshot,
  saveStatusSnapshot,
} from "~/lib/status-snapshot.server";
import { getStatusTargets } from "~/lib/status-targets.server";

function bearerFromRequest(request: Request): string | null {
  const raw = request.headers.get("Authorization")?.trim();
  if (!raw) return null;
  const m = raw.match(/^Bearer\s+(\S+)/i);
  return m?.[1]?.trim() ?? null;
}

function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const token = bearerFromRequest(request);
  if (!token) return false;
  try {
    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(secret, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Vercel Cron: scheduled GET from `vercel.json`. When `CRON_SECRET` is set in the Vercel project
 * (Production env), Vercel sends `Authorization: Bearer <CRON_SECRET>` — not configured in `vercel.json`.
 * Validates with `process.env.CRON_SECRET` here. Manual/local: `npm run status:cron`.
 *
 * **Multi-region:** Run the same URL from Stockholm, Frankfurt, Washington, etc. Identify each worker with
 * `?region=eu-stockholm` or header `X-Status-Probe-Region: eu-stockholm` (or `STATUS_PROBE_REGION` on the host).
 * Snapshots merge `results[].regions[regionId]` so /status shows latency per location. Set
 * `STATUS_CANONICAL_PROBE_REGION` to the same id on every deployment so timelines + uptime use one row per
 * tick (otherwise counts are multiplied by the number of regions). Optional `STATUS_PROBE_REGION_LABELS` JSON
 * object maps ids to display names, e.g. `{"eu-stockholm":"Stockholm","us-east-1":"Washington, DC"}`.
 */
export async function loader({ request }: Route.LoaderArgs) {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && !cronAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isProd && !cronAuthorized(request) && process.env.CRON_SECRET?.trim()) {
    return new Response("Unauthorized", { status: 401 });
  }

  const targets = getStatusTargets();
  const previousSnapshot = isMongoConfigured()
    ? await getLatestStatusSnapshot()
    : null;
  const results = await runStatusProbes(targets);
  const ok = overallOk(results);
  const probeRegion =
    parseProbeRegionFromRequest(request) ?? probeRegionFromEnv();
  let persisted = false;
  if (isMongoConfigured()) {
    persisted = await saveStatusSnapshot(results, ok, { probeRegion });
    await appendStatusHistoryRun(results, ok, { probeRegion });
    const freshFailures = probeRegion
      ? newlyFailingProbeResultsForRegion(
          previousSnapshot,
          results,
          probeRegion,
        )
      : newlyFailingProbeResults(previousSnapshot, results);
    if (freshFailures.length > 0) {
      await notifySubscribersNewProbeFailures({
        checkedAt: new Date().toISOString(),
        failures: freshFailures,
      });
    }
  }

  const body = JSON.stringify({
    ok: true,
    overallOk: ok,
    persisted,
    probeRegion: probeRegion ?? null,
    checkedAt: new Date().toISOString(),
    results,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
