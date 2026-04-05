import { data, useLoaderData } from "react-router";

import type { Route } from "./+types/docs.$product._index";
import { DocMeta } from "~/components/doc-meta";
import { MdxContent } from "~/components/mdx-content";
import { loadDoc } from "~/lib/docs.server";

export async function loader({ params }: Route.LoaderArgs) {
  const doc = await loadDoc(params.product!, undefined);
  if (!doc) throw data("Not found", { status: 404 });
  return doc;
}

export function meta({ data: doc }: Route.MetaArgs) {
  return [
    { title: doc ? `${doc.title} · inta.dev` : "Docs · inta.dev" },
    doc?.description
      ? { name: "description", content: doc.description }
      : null,
  ].filter(Boolean);
}

export default function ProductDocIndex() {
  const doc = useLoaderData<typeof loader>();

  return (
    <article className="docs-prose prose prose-zinc max-w-none dark:prose-invert prose-pre:bg-transparent prose-pre:p-0">
      <MdxContent code={doc.code} />
      <DocMeta
        lastUpdated={doc.lastUpdated}
        lastUpdatedSource={doc.lastUpdatedSource}
      />
    </article>
  );
}
