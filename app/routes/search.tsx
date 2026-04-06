import { useLoaderData } from "react-router";

import type { Route } from "./+types/search";
import { SearchPanel } from "~/components/search-panel";
import { translatePath } from "~/lib/i18n/messages";
import { resolveMetaLocale } from "~/lib/seo";
import { readSearchIndex } from "~/lib/search-index.server";

export async function loader(_: Route.LoaderArgs) {
  const documents = await readSearchIndex();
  return { documents };
}

export function meta({ matches, location }: Route.MetaArgs) {
  const locale = resolveMetaLocale(matches, location.pathname);
  return [
    { title: translatePath(locale, "seo.searchTitle") },
    {
      name: "description",
      content: translatePath(locale, "seo.searchDescription"),
    },
  ];
}

export default function SearchPage() {
  const { documents } = useLoaderData<typeof loader>();
  return <SearchPanel documents={documents} variant="page" autoFocus />;
}
