import { data } from "react-router";

import type { Route } from "./+types/api.indexnow.publish";
import { submitIndexNowUrls } from "~/lib/indexnow.server";
import { getSitemapUrlRows } from "~/lib/sitemap-entries.server";
import { absoluteUrl } from "~/lib/site";

function authorize(request: Request): boolean {
  const secret = process.env.INDEXNOW_PUBLISH_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("Authorization");
  return auth === `Bearer ${secret}`;
}

export function loader() {
  return new Response(
    JSON.stringify({
      message:
        "POST with Authorization: Bearer <INDEXNOW_PUBLISH_SECRET>. Optional JSON body { \"urls\": string[] }; omit body to submit the full sitemap URL set.",
    }),
    { status: 405, headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }
  if (!authorize(request)) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) {
    return data({ error: "INDEXNOW_KEY is not configured" }, { status: 503 });
  }

  let urls: string[];
  try {
    const raw = await request.text();
    if (!raw.trim()) {
      const rows = await getSitemapUrlRows();
      urls = rows.map((r) => absoluteUrl(r.pathname));
    } else {
      const body = JSON.parse(raw) as { urls?: unknown };
      if (!Array.isArray(body.urls)) {
        return data(
          {
            error:
              'Expected JSON { "urls": string[] } or an empty body for the full sitemap.',
          },
          { status: 400 },
        );
      }
      if (body.urls.some((u) => typeof u !== "string")) {
        return data({ error: "urls must be an array of strings" }, { status: 400 });
      }
      urls = body.urls.filter(Boolean);
    }
  } catch {
    return data({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await submitIndexNowUrls(urls);
  if (!result.ok) {
    const status =
      result.indexNowStatus >= 400 && result.indexNowStatus < 600
        ? result.indexNowStatus
        : 502;
    return data(result, { status });
  }

  return data({
    ok: true,
    indexNowStatus: result.indexNowStatus,
    batches: result.batches,
    urlCount: result.urlCount,
    detail: result.detail,
  });
}
