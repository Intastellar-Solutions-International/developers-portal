import { useLoaderData } from "react-router";

import type { Route } from "./+types/search";
import { SearchPanel } from "~/components/search-panel";
import { readSearchIndex } from "~/lib/search-index.server";

export async function loader(_: Route.LoaderArgs) {
  const documents = await readSearchIndex();
  return { documents };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search · inta.dev" },
    { name: "description", content: "Search Intastellar developer documentation." },
  ];
}

export default function SearchPage() {
  const { documents } = useLoaderData<typeof loader>();
  return <SearchPanel documents={documents} variant="page" autoFocus />;
}
