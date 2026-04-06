import { data } from "react-router";

import type { Route } from "./+types/$";
import { NotFoundPage } from "~/components/not-found-page";
import { translatePath } from "~/lib/i18n/messages";
import { resolveMetaLocale } from "~/lib/seo";

export async function loader(_args: Route.LoaderArgs) {
  return data(null, { status: 404 });
}

export function meta({ matches, location }: Route.MetaArgs) {
  const locale = resolveMetaLocale(matches, location.pathname);
  return [
    { title: translatePath(locale, "seo.notFoundTitle") },
    { name: "robots", content: "noindex" },
    {
      name: "description",
      content: translatePath(locale, "seo.notFoundDescription"),
    },
  ];
}

export default function NotFoundRoute() {
  return <NotFoundPage />;
}
