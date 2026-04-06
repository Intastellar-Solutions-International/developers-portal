import { timingSafeEqual } from "node:crypto";

import type { Route } from "./+types/api.status.cron";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { overallOk, runStatusProbes } from "~/lib/status-probe.server";
import { appendStatusHistoryRun } from "~/lib/status-history.server";
import { saveStatusSnapshot } from "~/lib/status-snapshot.server";
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
