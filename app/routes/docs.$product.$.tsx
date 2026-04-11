import { ObjectId } from "mongodb";
import {
  data,
  redirect,
  useFetcher,
  useLoaderData,
  useLocation,
  useMatches,
} from "react-router";

import type { Route } from "./+types/docs.$product.$";
import {
  DocSaveBookmarkHeader,
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
import { DEFAULT_LOCALE, isLocale, type Locale } from "~/lib/i18n/locale";
import { translatePath } from "~/lib/i18n/messages";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { resolvePortalSessionForRequest } from "~/lib/portal-account.server";
import { buildDocPageMeta, resolveMetaLocale } from "~/lib/seo";
import { getUserAccountById } from "~/lib/user-accounts.server";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";

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
  const accountLoginHref = withLocalePrefix("/account/login", locale);

  const payload = {
    ...doc,
    prev,
    next,
    breadcrumbs,
    version,
    locale,
    profileFormAction,
    accountLoginHref,
    /** Pre-translated with doc `locale` so header chrome matches SSR if `I18nProvider` lags one frame. */
    docBookmarkSaveLabel: translatePath(locale, "docs.saveToProfile"),
    docBookmarkRemoveLabel: translatePath(locale, "docs.removeFromProfile"),
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

/** Full doc-page snapshot (avoids treating stale/partial loader data as complete). */
function isDocSplatLoaderSnapshot(
  value: unknown,
): value is Awaited<ReturnType<typeof loader>> {
  if (value == null || typeof value !== "object") return false;
  const d = value as Record<string, unknown>;
  return (
    Array.isArray(d.breadcrumbs) &&
    typeof d.docProfileSaveVariant === "string" &&
    typeof d.docBookmarkSaveLabel === "string" &&
    typeof d.docBookmarkRemoveLabel === "string" &&
    typeof d.title === "string"
  );
}

function withDocBookmarkLabelFallbacks<T extends Record<string, unknown>>(
  d: T,
): T & {
  docBookmarkSaveLabel: string;
  docBookmarkRemoveLabel: string;
} {
  const locale: Locale = isLocale(d.locale as string) ? (d.locale as Locale) : DEFAULT_LOCALE;
  return {
    ...d,
    docBookmarkSaveLabel:
      typeof d.docBookmarkSaveLabel === "string"
        ? d.docBookmarkSaveLabel
        : translatePath(locale, "docs.saveToProfile"),
    docBookmarkRemoveLabel:
      typeof d.docBookmarkRemoveLabel === "string"
        ? d.docBookmarkRemoveLabel
        : translatePath(locale, "docs.removeFromProfile"),
  };
}

/**
 * `useLoaderData()` can be briefly incomplete during hydration while `useMatches()` still
 * carries this route's loader — same pattern as `useResolvedRootLoaderData` in `root.tsx`.
 */
function useResolvedDocSplatLoaderData() {
  const direct = useLoaderData<typeof loader>();
  const matches = useMatches();
  if (isDocSplatLoaderSnapshot(direct)) {
    return direct;
  }
  for (let i = matches.length - 1; i >= 0; i--) {
    const data = matches[i]?.loaderData;
    if (isDocSplatLoaderSnapshot(data)) {
      return data;
    }
  }
  /** Stale client payloads can omit `docBookmarkSaveLabel*`; only enrich when the rest is clearly this route. */
  if (
    direct &&
    typeof direct === "object" &&
    Array.isArray((direct as Record<string, unknown>).breadcrumbs) &&
    typeof (direct as Record<string, unknown>).docProfileSaveVariant === "string"
  ) {
    return withDocBookmarkLabelFallbacks(direct as Record<string, unknown>) as typeof direct;
  }
  return direct;
}

export default function ProductDocPage() {
  const doc = useResolvedDocSplatLoaderData();
  const bookmarkFetcher = useFetcher<BookmarkActionData>();
  const inta = useIntastellarAuth();

  const { pathname } = useLocation();
  if (doc == null) {
    return null;
  }
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
          <DocSaveBookmarkHeader
            variant={doc.docProfileSaveVariant}
            message={doc.docProfileSaveMessage}
            profileFormAction={doc.profileFormAction}
            accountLoginHref={doc.accountLoginHref}
            canonicalPath={doc.canonicalDocPath}
            title={doc.title}
            saved={doc.docSavedToProfile}
            bookmarkFetcher={bookmarkFetcher}
            bookmarkSaveLabel={doc.docBookmarkSaveLabel}
            bookmarkRemoveLabel={doc.docBookmarkRemoveLabel}
            ssoPopupAvailable={inta.configured}
            onSignInPopup={() => void inta.signin()}
            signInPopupLoading={inta.isLoading}
          />
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
      <RelatedLinks items={doc.related ?? []} />
      {doc.docProfileSaveVariant === "bookmark" ? (
        <DocSaveToProfile
          variant={doc.docProfileSaveVariant}
          message={doc.docProfileSaveMessage}
          canonicalPath={doc.canonicalDocPath}
          title={doc.title}
          initiallySaved={doc.docSavedToProfile}
          profileFormAction={doc.profileFormAction}
          bookmarkFetcher={bookmarkFetcher}
        />
      ) : null}
      <DocPrevNext prev={doc.prev} next={doc.next} />
      <DocMeta
        lastUpdated={doc.lastUpdated}
        lastUpdatedSource={doc.lastUpdatedSource}
      />
    </article>
  );
}
