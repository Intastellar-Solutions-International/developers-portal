import type { Route } from "./+types/sitemap-xml";
import { getAllDocPathnamesForSitemap } from "~/lib/docs.server";
import { SUPPORTED_LOCALES } from "~/lib/i18n/locale";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
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

function expandPathnamesForAllLocales(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    for (const locale of SUPPORTED_LOCALES) {
      out.push(withLocalePrefix(p, locale));
    }
  }
  return out;
}

export async function loader(_args: Route.LoaderArgs) {
  const [staticPaths, docPathsUnloc] = await Promise.all([
    getStaticPathnamesFromRoutes(),
    getAllDocPathnamesForSitemap(),
  ]);
  /** `staticPaths` includes localized prefixes from the route tree. */
  const localizedDocs = expandPathnamesForAllLocales(docPathsUnloc);
  const pathnames = uniqueSortedPaths([...staticPaths, ...localizedDocs]);
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
