import { data, redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/docs.$product.$";
import { DocMeta } from "~/components/doc-meta";
import { DocPrevNext } from "~/components/doc-prev-next";
import { DocsBreadcrumbs } from "~/components/docs-breadcrumbs";
import { IntaConsentTryout } from "~/components/inta-consent-tryout";
import { MdxContent } from "~/components/mdx-content";
import { RelatedLinks } from "~/components/related-links";
import {
  getAdjacentDocs,
  getDocBreadcrumbs,
  getDocsNavFlat,
  loadDoc,
} from "~/lib/docs.server";
import { docHref, parseDocSplat } from "~/lib/docs-versions";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { buildDocPageMeta, resolveMetaLocale } from "~/lib/seo";
import { translatePath } from "~/lib/i18n/messages";

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = resolveLocaleFromRequest(request);
  const splat = params["*"]?.replace(/^\/+|\/+$/g, "") ?? "";
  const product = params.product!;
  const parsed = parseDocSplat(product, splat, locale);
  if ("redirect" in parsed) throw redirect(parsed.redirect);
  const { version, docPath } = parsed;

  if (
    product === "accounts-sign-in" &&
    (docPath === "javascript/plain-html-and-js" ||
      docPath === "web/javascript-without-react")
  ) {
    throw redirect(
      docHref(locale, product, version, "web/plain-html-css-js"),
    );
  }

  const doc = await loadDoc(product, docPath, locale);
  if (!doc) throw data("Not found", { status: 404 });
  const pathname = new URL(request.url).pathname;
  const navFlat = await getDocsNavFlat(product, version, locale);
  const { prev, next } = getAdjacentDocs(navFlat, pathname);
  const breadcrumbs = await getDocBreadcrumbs(
    product,
    version,
    pathname,
    doc.title,
    locale,
  );
  const intaTryout =
    product === "cookie-banner" && docPath === "javascript/try-out";
  const url = new URL(request.url);
  return {
    ...doc,
    prev,
    next,
    breadcrumbs,
    version,
    locale,
    intaTryout,
    ...(intaTryout
      ? {
          previewOrigin: url.origin,
          previewHostname: url.hostname,
        }
      : {}),
  };
}

export function meta({ data, loaderData, location, matches }: Route.MetaArgs) {
  const doc = loaderData ?? data;
  if (!doc) {
    const locale = resolveMetaLocale(matches, location.pathname);
    return [
      { title: `${translatePath(locale, "docs.hubMetaTitleCore")} · inta.dev` },
    ];
  }
  return buildDocPageMeta({
    title: doc.title,
    description: doc.description,
    pathname: location.pathname,
    modifiedTime: doc.lastUpdated,
    ogImage: doc.ogImage,
    locale: doc.locale,
  });
}

export default function ProductDocPage() {
  const doc = useLoaderData<typeof loader>();

  return (
    <article className="docs-prose prose prose-zinc max-w-none dark:prose-invert prose-pre:bg-transparent prose-pre:p-0">
      <DocsBreadcrumbs items={doc.breadcrumbs} />
      {doc.intaTryout && doc.previewOrigin && doc.previewHostname ? (
        <>
          <h1>{doc.title}</h1>
          {doc.description ? (
            <p className="lead text-zinc-600 dark:text-zinc-400">{doc.description}</p>
          ) : null}
          <IntaConsentTryout
            previewOrigin={doc.previewOrigin}
            previewHostname={doc.previewHostname}
          />
        </>
      ) : (
        <MdxContent code={doc.code} />
      )}
      <RelatedLinks items={doc.related} />
      <DocPrevNext prev={doc.prev} next={doc.next} />
      <DocMeta
        lastUpdated={doc.lastUpdated}
        lastUpdatedSource={doc.lastUpdatedSource}
      />
    </article>
  );
}
