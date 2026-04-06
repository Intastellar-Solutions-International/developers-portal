import type { Route } from "./+types/api.status.feed";
import {
  buildStatusRssXml,
  parseStatusFeedTopicsParam,
} from "~/lib/status-feed.server";

/** RSS 2.0 feed of operator notices + scheduled maintenance. */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const topics = parseStatusFeedTopicsParam(url.searchParams.get("topics"));
  const body = await buildStatusRssXml(topics);
  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
