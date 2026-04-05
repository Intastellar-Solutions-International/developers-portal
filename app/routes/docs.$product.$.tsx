import { data, useLoaderData } from "react-router";

import type { Route } from "./+types/docs.$product.$";
import { DocMeta } from "~/components/doc-meta";
import { DocPrevNext } from "~/components/doc-prev-next";
import { MdxContent } from "~/components/mdx-content";
import {
  getAdjacentDocs,
  getDocsNavFlat,
  loadDoc,
} from "~/lib/docs.server";
import { buildDocPageMeta } from "~/lib/seo";

export async function loader({ params, request }: Route.LoaderArgs) {
  const splat = params["*"]?.replace(/^\/+|\/+$/g, "") ?? "";
  const doc = await loadDoc(params.product!, splat || undefined);
  if (!doc) throw data("Not found", { status: 404 });
  const pathname = new URL(request.url).pathname;
  const navFlat = await getDocsNavFlat(params.product!);
  const { prev, next } = getAdjacentDocs(navFlat, pathname);
  return { ...doc, prev, next };
}

export function meta({ data: doc, location }: Route.MetaArgs) {
  if (!doc) return [{ title: "Docs · inta.dev" }];
  return buildDocPageMeta({
    title: doc.title,
    description: doc.description,
    pathname: location.pathname,
    modifiedTime: doc.lastUpdated,
  });
}

export default function ProductDocPage() {
  const doc = useLoaderData<typeof loader>();

  return (
    <article className="docs-prose prose prose-zinc max-w-none dark:prose-invert prose-pre:bg-transparent prose-pre:p-0">
      <MdxContent code={doc.code} />
      <DocPrevNext prev={doc.prev} next={doc.next} />
      <DocMeta
        lastUpdated={doc.lastUpdated}
        lastUpdatedSource={doc.lastUpdatedSource}
      />
    </article>
  );
}
