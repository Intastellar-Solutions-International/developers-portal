import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("robots.txt", "routes/robots-txt.tsx"),
  route("sitemap.xml", "routes/sitemap-xml.tsx"),
  route("search", "routes/search.tsx"),
  route("changelog", "routes/changelog.tsx"),
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
] satisfies RouteConfig;
