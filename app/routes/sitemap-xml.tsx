import type { Route } from "./+types/sitemap-xml";
import { getSitemapUrlRows } from "~/lib/sitemap-entries.server";
import { absoluteUrl } from "~/lib/site";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function loader(_args: Route.LoaderArgs) {
  const rows = await getSitemapUrlRows();

  const urlBlocks = rows.map((row) => {
    const loc = escapeXml(absoluteUrl(row.pathname));
    const lastmod = escapeXml(row.lastmod);
    const priority = escapeXml(row.priority);
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlBlocks.join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
