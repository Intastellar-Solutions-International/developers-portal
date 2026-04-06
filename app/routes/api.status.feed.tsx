import type { Route } from "./+types/api.status.feed";
import { buildStatusRssXml } from "~/lib/status-feed.server";

/** RSS 2.0 feed of operator notices + scheduled maintenance. */
export async function loader(_: Route.LoaderArgs) {
  const body = await buildStatusRssXml();
  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
