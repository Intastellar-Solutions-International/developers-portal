import type { Route } from "./+types/api.status.uptime";
import {
  getStatusHistoryMaxPoints,
  getStoredOverallUptime,
} from "~/lib/status-history.server";

/**
 * Public JSON for embedding an uptime widget on marketing / product pages.
 * Same calculation as `/status` (stored scheduled runs where every check passed).
 */
export async function loader({ request }: Route.LoaderArgs) {
  const computedAt = new Date().toISOString();
  const windowMaxRuns = getStatusHistoryMaxPoints();
  const stored = await getStoredOverallUptime(windowMaxRuns);
  const statusPageUrl = new URL("/status", request.url).href;
  const badgeEmbedUrl = new URL("/api/status/uptime/badge", request.url).href;

  const body = stored
    ? JSON.stringify({
        ok: true as const,
        computedAt,
        source: "history" as const,
        uptimePercent: stored.percent,
        displayPercent:
          stored.percent % 1 === 0
            ? `${stored.percent.toFixed(0)}%`
            : `${stored.percent.toFixed(1)}%`,
        passedRuns: stored.passedRuns,
        totalRuns: stored.totalRuns,
        windowMaxRuns,
        statusPageUrl,
        badgeEmbedUrl,
        /** Ready-made short line for a widget title, e.g. "100% uptime" */
        widgetTitle: `${stored.percent % 1 === 0 ? stored.percent.toFixed(0) : stored.percent.toFixed(1)}% uptime`,
        /** Plain-language line for subtitle / tooltip */
        widgetDescription: `In the last ${stored.totalRuns} scheduled runs, ${stored.passedRuns} finished with every service responding normally.`,
      })
    : JSON.stringify({
        ok: true as const,
        computedAt,
        source: "no_history" as const,
        uptimePercent: null,
        displayPercent: null,
        passedRuns: 0,
        totalRuns: 0,
        windowMaxRuns,
        statusPageUrl,
        badgeEmbedUrl,
        widgetTitle: null,
        widgetDescription:
          "Uptime will appear here after scheduled health checks have been stored.",
      });

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
