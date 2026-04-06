import type { Route } from "./+types/api.status.uptime";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { interpolate, translatePath } from "~/lib/i18n/messages";
import { resolveLocaleForApiRequest } from "~/lib/i18n/resolve-locale.server";
import {
  getStatusHistoryMaxPoints,
  getStoredOverallUptime,
} from "~/lib/status-history.server";

/**
 * Public JSON for embedding an uptime widget on marketing / product pages.
 * Same calculation as `/status` (stored scheduled runs where every check passed).
 *
 * Language for `widgetTitle`, `widgetDescription`, and URL fields: `?locale=de|da|fr|nl|en`
 * or `Accept-Language`; defaults to English. `badgeEmbedUrl` includes `?locale=` so iframe
 * badges stay aligned with the JSON locale.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveLocaleForApiRequest(request);
  const computedAt = new Date().toISOString();
  const windowMaxRuns = getStatusHistoryMaxPoints();
  const stored = await getStoredOverallUptime(windowMaxRuns);
  const statusPageUrl = new URL(
    withLocalePrefix("/status", locale),
    request.url,
  ).href;
  const badgeEmbedUrl = new URL(
    `/api/status/uptime/badge?locale=${locale}`,
    request.url,
  ).href;

  const body = stored
    ? JSON.stringify({
        ok: true as const,
        locale,
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
        widgetTitle: interpolate(translatePath(locale, "status.badgeMainUptime"), {
          percent:
            stored.percent % 1 === 0
              ? `${stored.percent.toFixed(0)}%`
              : `${stored.percent.toFixed(1)}%`,
        }),
        /** Plain-language line for subtitle / tooltip */
        widgetDescription: interpolate(
          translatePath(locale, "status.uptimeJsonWidgetDescription"),
          {
            totalRuns: stored.totalRuns,
            passedRuns: stored.passedRuns,
          },
        ),
      })
    : JSON.stringify({
        ok: true as const,
        locale,
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
        widgetDescription: translatePath(
          locale,
          "status.uptimeJsonNoHistoryDescription",
        ),
      });

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "Access-Control-Allow-Origin": "*",
      Vary: "Accept-Language",
    },
  });
}
