import { ObjectId } from "mongodb";
import {
  data,
  redirect,
  useFetcher,
  useLoaderData,
  useLocation,
} from "react-router";

import type { Route } from "./+types/docs.$product.$";
import {
  DocSaveProfileHeaderIcon,
  DocSaveToProfile,
  type BookmarkActionData,
  type DocProfileSaveVariant,
} from "~/components/doc-save-to-profile";
import { DocMeta } from "~/components/doc-meta";
import { DocPrevNext } from "~/components/doc-prev-next";
import { DocsBreadcrumbs } from "~/components/docs-breadcrumbs";
import { CookieBannerTryoutDocBody } from "~/components/cookie-banner-tryout-doc-body";
import { RelatedLinks } from "~/components/related-links";
import {
  getAdjacentDocs,
  getDocBreadcrumbs,
  getDocsNavFlat,
  loadDoc,
} from "~/lib/docs.server";
import {
  docHref,
  docsProductSlugFromPathname,
  parseDocSplat,
  parseDocsProductPath,
  unlocalizedDocPath,
} from "~/lib/docs-versions";
import { translatePath } from "~/lib/i18n/messages";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { resolvePortalSessionForRequest } from "~/lib/portal-account.server";
import { buildDocPageMeta, resolveMetaLocale } from "~/lib/seo";
import { getUserAccountById } from "~/lib/user-accounts.server";

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
  const url = new URL(request.url);
  const isJavascriptTryOutDoc =
    product === "cookie-banner" && docPath === "javascript/try-out";

  const canonicalDocPath = unlocalizedDocPath(product, version, docPath);
  const { account, setCookieHeaders } =
    await resolvePortalSessionForRequest(request);
  const mongoConfigured = isMongoConfigured();

  let docProfileSaveVariant: DocProfileSaveVariant = "sign_in";
  let docProfileSaveMessage: string | null = translatePath(
    locale,
    "docs.saveToProfileHint",
  );
  let docSavedToProfile = false;

  if (!mongoConfigured) {
    docProfileSaveVariant = "mongo_off";
    docProfileSaveMessage = translatePath(locale, "profile.savedDocsMongoOff");
  } else if (!account?.email) {
    docProfileSaveVariant = "sign_in";
    docProfileSaveMessage = translatePath(locale, "docs.saveToProfileHint");
  } else if (!account.accountId?.trim()) {
    docProfileSaveVariant = "link_account";
    docProfileSaveMessage = translatePath(locale, "profile.savedDocsNeedAccount");
  } else {
    docProfileSaveVariant = "bookmark";
    docProfileSaveMessage = null;
    try {
      const oid = new ObjectId(account.accountId);
      const userDoc = await getUserAccountById(oid);
      docSavedToProfile = (userDoc?.savedDocumentation ?? []).some(
        (b) => b.path === canonicalDocPath,
      );
    } catch {
      docSavedToProfile = false;
    }
  }

  const profileFormAction = withLocalePrefix("/account/profile", locale);

  const payload = {
    ...doc,
    prev,
    next,
    breadcrumbs,
    version,
    locale,
    profileFormAction,
    /** Always from the request URL so serialized loader data matches SSR on hydration. */
    previewOrigin: url.origin,
    previewHostname: url.hostname,
    isJavascriptTryOutDoc,
    /** Redundant with isJavascriptTryOutDoc — strings help if a client hydrate quirk drops the boolean. */
    productSlug: product,
    docPath: docPath ?? "",
    canonicalDocPath,
    docSavedToProfile,
    docProfileSaveVariant,
    docProfileSaveMessage,
  };

  if (setCookieHeaders.length === 0) {
    return payload;
  }
  const headers = new Headers();
  for (const c of setCookieHeaders) {
    headers.append("Set-Cookie", c);
  }
  return data(payload, { headers });
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
    breadcrumbs: doc.breadcrumbs,
  });
}

export default function ProductDocPage() {
  const doc = useLoaderData<typeof loader>();
  const bookmarkFetcher = useFetcher<BookmarkActionData>();
  const isBookmark = doc.docProfileSaveVariant === "bookmark";
  const { pathname } = useLocation();
  const docPathNorm = (doc.docPath ?? "").replace(/^\/+|\/+$/g, "");
  const productSlug = doc.productSlug ?? "";
  const loaderTryout =
    doc.isJavascriptTryOutDoc === true ||
    (productSlug === "cookie-banner" && docPathNorm === "javascript/try-out");
  const productFromPath = docsProductSlugFromPathname(pathname);
  const { docTail } = parseDocsProductPath(pathname, productFromPath);
  const docTailNorm = docTail.replace(/^\/+|\/+$/g, "");
  const urlTryout =
    productFromPath === "cookie-banner" && docTailNorm === "javascript/try-out";
  /** URL fallback avoids an empty MDX shell when loader fields are briefly missing during hydration. */
  const showIntaTryout = loaderTryout || urlTryout;

  return (
    <article className="docs-prose prose prose-zinc max-w-none dark:prose-invert prose-pre:bg-transparent prose-pre:p-0">
      <DocsBreadcrumbs
        items={doc.breadcrumbs}
        toolbar={
          isBookmark ? (
            <DocSaveProfileHeaderIcon
              fetcher={bookmarkFetcher}
              profileAction={doc.profileFormAction}
              canonicalPath={doc.canonicalDocPath}
              title={doc.title}
              saved={doc.docSavedToProfile}
            />
          ) : null
        }
      />
      <CookieBannerTryoutDocBody
        tryout={showIntaTryout}
        title={doc.title}
        description={doc.description}
        code={doc.code}
        previewOrigin={doc.previewOrigin}
        previewHostname={doc.previewHostname}
      />
      <RelatedLinks items={doc.related} />
      <DocSaveToProfile
        variant={doc.docProfileSaveVariant}
        message={doc.docProfileSaveMessage}
        canonicalPath={doc.canonicalDocPath}
        title={doc.title}
        initiallySaved={doc.docSavedToProfile}
        profileFormAction={doc.profileFormAction}
        bookmarkFetcher={isBookmark ? bookmarkFetcher : undefined}
      />
      <DocPrevNext prev={doc.prev} next={doc.next} />
      <DocMeta
        lastUpdated={doc.lastUpdated}
        lastUpdatedSource={doc.lastUpdatedSource}
      />
    </article>
  );
}
