import { data, redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/docs.$product.$";
import { DocMeta } from "~/components/doc-meta";
import { DocPrevNext } from "~/components/doc-prev-next";
import { DocsBreadcrumbs } from "~/components/docs-breadcrumbs";
import { MdxContent } from "~/components/mdx-content";
import { RelatedLinks } from "~/components/related-links";
import {
  getAdjacentDocs,
  getDocBreadcrumbs,
  getDocsNavFlat,
  loadDoc,
} from "~/lib/docs.server";
import { docHref, parseDocSplat } from "~/lib/docs-versions";
import { buildDocPageMeta } from "~/lib/seo";

export async function loader({ params, request }: Route.LoaderArgs) {
  const splat = params["*"]?.replace(/^\/+|\/+$/g, "") ?? "";
  const product = params.product!;
  const parsed = parseDocSplat(product, splat);
  if ("redirect" in parsed) throw redirect(parsed.redirect);
  const { version, docPath } = parsed;

  if (
    product === "accounts-sign-in" &&
    docPath === "javascript/plain-html-and-js"
  ) {
    throw redirect(
      docHref(product, version, "web/javascript-without-react"),
    );
  }

  const doc = await loadDoc(product, docPath);
  if (!doc) throw data("Not found", { status: 404 });
  const pathname = new URL(request.url).pathname;
  const navFlat = await getDocsNavFlat(product, version);
  const { prev, next } = getAdjacentDocs(navFlat, pathname);
  const breadcrumbs = await getDocBreadcrumbs(
    product,
    version,
    pathname,
    doc.title,
  );
  return { ...doc, prev, next, breadcrumbs, version };
}

export function meta({ data: doc, location }: Route.MetaArgs) {
  if (!doc) return [{ title: "Docs · inta.dev" }];
  return buildDocPageMeta({
    title: doc.title,
    description: doc.description,
    pathname: location.pathname,
    modifiedTime: doc.lastUpdated,
    ogImage: doc.ogImage,
  });
}

export default function ProductDocPage() {
  const doc = useLoaderData<typeof loader>();

  return (
    <article className="docs-prose prose prose-zinc max-w-none dark:prose-invert prose-pre:bg-transparent prose-pre:p-0">
      <DocsBreadcrumbs items={doc.breadcrumbs} />
      <MdxContent code={doc.code} />
      <RelatedLinks items={doc.related} />
      <DocPrevNext prev={doc.prev} next={doc.next} />
      <DocMeta
        lastUpdated={doc.lastUpdated}
        lastUpdatedSource={doc.lastUpdatedSource}
      />
    </article>
  );
}
