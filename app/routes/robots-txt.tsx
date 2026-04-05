import type { Route } from "./+types/robots-txt";
import { absoluteUrl } from "~/lib/site";

export async function loader(_args: Route.LoaderArgs) {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
