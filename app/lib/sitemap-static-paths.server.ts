import type { RouteConfigEntry } from "@react-router/dev/routes";

import routeTree from "../routes";

/** Route modules excluded from the sitemap (non-HTML, redirects, catch-all). */
const SKIP_ROUTE_FILES = new Set([
  "routes/robots-txt.tsx",
  "routes/sitemap-xml.tsx",
  "routes/internal.status-ops.tsx",
  "routes/changelog.tsx",
  "routes/api.status.cron.tsx",
  "routes/api.status.json.tsx",
  "routes/api.status.uptime.tsx",
  "routes/api.status.uptime-badge.tsx",
  "routes/$.tsx",
]);

/** Indexable static routes we still omit (private pages, auth actions, non-HTML). */
const SKIP_PATHNAMES = new Set([
  "/account",
  "/account/profile",
  "/account/api-keys",
  "/auth/logout",
  "/auth/login",
  "/api/status/cron",
  "/api/status/uptime/badge",
  "/auth/session",
  "/internal/status-ops",
]);

function routeFileSkipped(file: string): boolean {
  const n = file.replace(/\\/g, "/");
  for (const suffix of SKIP_ROUTE_FILES) {
    if (n.endsWith(suffix)) return true;
  }
  return false;
}

function isDynamicPathSegment(segment: string): boolean {
  return /[:*]/.test(segment);
}

function joinPath(parent: string, segment: string): string {
  const seg = segment.replace(/^\/+|\/+$/g, "");
  if (!seg) return parent || "/";
  if (!parent || parent === "/") return `/${seg}`.replace(/\/+/g, "/");
  return `${parent.replace(/\/+$/, "")}/${seg}`.replace(/\/+/g, "/");
}

function normalizePathname(path: string): string {
  if (!path || path === "/") return "/";
  let u = path.startsWith("/") ? path : `/${path}`;
  u = u.replace(/\/+/g, "/");
  if (u.length > 1) u = u.replace(/\/$/, "");
  return u;
}

function walkRoutes(
  entries: RouteConfigEntry[],
  parentUrl: string,
  out: Set<string>,
): void {
  for (const entry of entries) {
    if (routeFileSkipped(entry.file)) continue;

    if (entry.index) {
      const pathStr = entry.path;
      const url = normalizePathname(
        pathStr != null && pathStr !== ""
          ? joinPath(parentUrl, pathStr)
          : parentUrl || "/",
      );
      if (!SKIP_PATHNAMES.has(url)) out.add(url);
      continue;
    }

    if (entry.path == null && entry.children) {
      walkRoutes(entry.children, parentUrl, out);
      continue;
    }

    if (entry.path != null && isDynamicPathSegment(entry.path)) {
      continue;
    }

    if (entry.path != null) {
      const url = normalizePathname(joinPath(parentUrl, entry.path));
      if (entry.children?.length) {
        walkRoutes(entry.children, url, out);
      } else if (!SKIP_PATHNAMES.has(url)) {
        out.add(url);
      }
    } else if (entry.children) {
      walkRoutes(entry.children, parentUrl, out);
    }
  }
}

async function resolvedRouteTree(): Promise<RouteConfigEntry[]> {
  const tree = routeTree as RouteConfigEntry[] | Promise<RouteConfigEntry[]>;
  return Array.isArray(tree) ? tree : await tree;
}

/** Static URL pathnames derived from `app/routes.ts` (no param/splat routes). */
export async function getStaticPathnamesFromRoutes(): Promise<string[]> {
  const entries = await resolvedRouteTree();
  const out = new Set<string>();
  walkRoutes(entries, "", out);
  return [...out].sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b, "en");
  });
}
