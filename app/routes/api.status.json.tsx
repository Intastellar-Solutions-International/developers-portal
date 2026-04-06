import type { Route } from "./+types/api.status.json";
import { getLatestStatusSnapshot } from "~/lib/status-snapshot.server";

/** Public JSON for the status widget and integrations. */
export async function loader(_: Route.LoaderArgs) {
  const snapshot = await getLatestStatusSnapshot();
  const body = JSON.stringify({
    snapshot,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
