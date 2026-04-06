import type { Route } from "./+types/api.status.cron";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { overallOk, runStatusProbes } from "~/lib/status-probe.server";
import { appendStatusHistoryRun } from "~/lib/status-history.server";
import { saveStatusSnapshot } from "~/lib/status-snapshot.server";
import { getStatusTargets } from "~/lib/status-targets.server";

function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("Authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * Vercel Cron: GET with `Authorization: Bearer $CRON_SECRET`.
 * Runs probes, persists to Mongo when configured, returns JSON summary.
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
  const results = await runStatusProbes(targets);
  const ok = overallOk(results);
  let persisted = false;
  if (isMongoConfigured()) {
    persisted = await saveStatusSnapshot(results, ok);
    await appendStatusHistoryRun(results, ok);
  }

  const body = JSON.stringify({
    ok: true,
    overallOk: ok,
    persisted,
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
