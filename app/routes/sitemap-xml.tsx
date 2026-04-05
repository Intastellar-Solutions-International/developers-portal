import type { Route } from "./+types/sitemap-xml";
import { getAllDocPathnamesForSitemap } from "~/lib/docs.server";
import { absoluteUrl } from "~/lib/site";

const STATIC_PATHS = [
  "/",
  "/docs",
  "/search",
  "/consents/changelog",
  "/legal",
  "/legal/privacy",
  "/legal/terms",
] as const;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function loader(_args: Route.LoaderArgs) {
  const docPaths = await getAllDocPathnamesForSitemap();
  const urls = [...STATIC_PATHS, ...docPaths].map((p) =>
    escapeXml(absoluteUrl(p)),
  );

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
