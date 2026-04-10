import fs from "node:fs/promises";
import path from "node:path";

import type { Route } from "./+types/sitemap-xml";
import { getDocSitemapEntries } from "~/lib/docs.server";
import { SUPPORTED_LOCALES } from "~/lib/i18n/locale";
import { stripLocalePrefix, withLocalePrefix } from "~/lib/i18n/localized-path";
import { getStaticPathnamesFromRoutes } from "~/lib/sitemap-static-paths.server";
import { absoluteUrl } from "~/lib/site";

type SitemapUrlRow = { pathname: string; lastmod: string; priority: string };

/** App shell + lockfile mtimes (routes, root, dependency lock). */
async function getStaticShellLastmodMs(): Promise<number> {
  const candidates = [
    path.join(process.cwd(), "app", "routes.ts"),
    path.join(process.cwd(), "app", "root.tsx"),
    path.join(process.cwd(), "package-lock.json"),
    path.join(process.cwd(), "pnpm-lock.yaml"),
  ];
  let maxMs = 0;
  for (const f of candidates) {
    try {
      const st = await fs.stat(f);
      maxMs = Math.max(maxMs, st.mtimeMs);
    } catch {
      /* missing in some deploy contexts */
    }
  }
  return maxMs;
}

function maxLastmodMsFromDocEntries(
  entries: readonly { lastmod: string }[],
): number {
  let maxMs = 0;
  for (const e of entries) {
    const t = Date.parse(e.lastmod);
    if (Number.isFinite(t)) maxMs = Math.max(maxMs, t);
  }
  return maxMs;
}

function priorityForPathname(pathname: string): string {
  const bare = stripLocalePrefix(pathname);
  if (bare === "/" || bare === "") return "1.0";
  if (bare === "/docs") return "0.9";
  if (bare.startsWith("/docs/")) return "0.8";
  if (bare.startsWith("/legal")) return "0.4";
  return "0.6";
}

function expandDocEntriesForAllLocales(
  entries: readonly { pathname: string; lastmod: string }[],
): SitemapUrlRow[] {
  const out: SitemapUrlRow[] = [];
  for (const e of entries) {
    for (const locale of SUPPORTED_LOCALES) {
      const pathname = withLocalePrefix(e.pathname, locale);
      out.push({
        pathname,
        lastmod: e.lastmod,
        priority: priorityForPathname(pathname),
      });
    }
  }
  return out;
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
  const [staticPathnames, docEntries, shellMs] = await Promise.all([
    getStaticPathnamesFromRoutes(),
    getDocSitemapEntries(),
    getStaticShellLastmodMs(),
  ]);
  const docMaxMs = maxLastmodMsFromDocEntries(docEntries);
  const staticLastmod = new Date(
    Math.max(shellMs, docMaxMs) > 0 ? Math.max(shellMs, docMaxMs) : Date.now(),
  ).toISOString();

  const staticRows: SitemapUrlRow[] = staticPathnames.map((pathname) => ({
    pathname,
    lastmod: staticLastmod,
    priority: priorityForPathname(pathname),
  }));
  const docRows = expandDocEntriesForAllLocales(docEntries);

  const byPath = new Map<string, SitemapUrlRow>();
  for (const row of staticRows) byPath.set(row.pathname, row);
  for (const row of docRows) byPath.set(row.pathname, row);

  const rows = [...byPath.values()].sort((a, b) => {
    if (a.pathname === "/") return -1;
    if (b.pathname === "/") return 1;
    return a.pathname.localeCompare(b.pathname, "en");
  });

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
