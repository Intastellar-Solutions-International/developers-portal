import {
  type RouteConfig,
  type RouteConfigEntry,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

/** Duplicate localized trees need unique route ids (same `.tsx` module path). */
function suffixRouteIds(
  entries: RouteConfigEntry[],
  suffix: string,
): RouteConfigEntry[] {
  return entries.map((entry) => {
    const inferred =
      entry.id ??
      entry.file
        .replace(/\\/g, "/")
        .replace(/^.*\/routes\//, "routes/")
        .replace(/\.tsx$/, "");
    return {
      ...entry,
      id: `${inferred}__${suffix}`,
      children: entry.children?.length
        ? suffixRouteIds(entry.children, suffix)
        : undefined,
    };
  });
}

/** Non-localized URLs (APIs, crawlers, assets). */
const systemRoutes: RouteConfigEntry[] = [
  route("robots.txt", "routes/robots-txt.tsx"),
  route("sitemap.xml", "routes/sitemap-xml.tsx"),
  route("internal/status-ops", "routes/internal.status-ops.tsx"),
  route("api/status/cron", "routes/api.status.cron.tsx"),
  route("api/status.json", "routes/api.status.json.tsx"),
  route("api/status/feed.xml", "routes/api.status.feed.tsx"),
  route("api/status/subscribe", "routes/api.status.subscribe.tsx"),
  route("api/status/notify/verify", "routes/api.status.notify.verify.tsx"),
  route("api/status/notify/unsubscribe", "routes/api.status.notify.unsubscribe.tsx"),
  route("api/status/uptime", "routes/api.status.uptime.tsx"),
  route("api/status/uptime/badge", "routes/api.status.uptime-badge.tsx"),
];

/** User-facing routes mirrored under `/de`, `/da`, `/fr`, `/nl`, `/pt-br` for SEO (English stays unprefixed). */
const localizedAppRoutes: RouteConfigEntry[] = [
  index("routes/home.tsx"),
  route("search", "routes/search.tsx"),
  ...prefix("auth", [
    route("logout", "routes/auth.logout.tsx"),
    route("session", "routes/auth.session.tsx"),
  ]),
  route("changelog", "routes/changelog.tsx"),
  route("status", "routes/status.tsx"),
  ...prefix("consents", [
    route("changelog", "routes/consents.changelog.tsx"),
  ]),
  route("legal", "routes/legal.tsx", [
    index("routes/legal._index.tsx"),
    route("privacy", "routes/legal.privacy.tsx"),
    route("terms", "routes/legal.terms.tsx"),
  ]),
  ...prefix("docs", [
    layout("routes/docs.layout.tsx", [
      index("routes/docs._index.tsx"),
      route(":product", "routes/docs.$product.tsx", [
        index("routes/docs.$product._index.tsx"),
        route("*", "routes/docs.$product.$.tsx"),
      ]),
    ]),
  ]),
  route("account", "routes/account.tsx", [
    index("routes/account._index.tsx"),
    route("login", "routes/account.login.tsx"),
    route("profile", "routes/account.profile.tsx"),
    route("api-keys", "routes/account.api-keys.tsx"),
  ]),
  route("*", "routes/$.tsx"),
];

export default [
  ...systemRoutes,
  ...localizedAppRoutes,
  ...prefix("de", suffixRouteIds(localizedAppRoutes, "de")),
  ...prefix("da", suffixRouteIds(localizedAppRoutes, "da")),
  ...prefix("fr", suffixRouteIds(localizedAppRoutes, "fr")),
  ...prefix("nl", suffixRouteIds(localizedAppRoutes, "nl")),
  ...prefix("pt-br", suffixRouteIds(localizedAppRoutes, "pt-br")),
] satisfies RouteConfig;
