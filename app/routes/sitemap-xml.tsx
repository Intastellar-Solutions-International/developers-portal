import type { Route } from "./+types/sitemap-xml";
import { getAllDocPathnamesForSitemap } from "~/lib/docs.server";
import { getStaticPathnamesFromRoutes } from "~/lib/sitemap-static-paths.server";
import { absoluteUrl } from "~/lib/site";

function uniqueSortedPaths(paths: readonly string[]): string[] {
  const set = new Set(paths);
  const list = [...set];
  list.sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b, "en");
  });
  return list;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function loader(_args: Route.LoaderArgs) {
  const [staticPaths, docPaths] = await Promise.all([
    getStaticPathnamesFromRoutes(),
    getAllDocPathnamesForSitemap(),
  ]);
  const pathnames = uniqueSortedPaths([...staticPaths, ...docPaths]);
  const urls = pathnames.map((p) => escapeXml(absoluteUrl(p)));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
