import type { MetaDescriptor } from "react-router";

import { DEFAULT_LOCALE, isLocale, type Locale } from "~/lib/i18n/locale";
import { getLocaleFromPathname } from "~/lib/i18n/localized-path";
import {
  interpolate,
  translatePath,
} from "~/lib/i18n/messages";
import { absoluteUrl, siteOrigin } from "~/lib/site";

const SITE_NAME = "inta.dev";

const INTASTELLAR_ORG_LOGO =
  "https://www.intastellarsolutions.com/assets/logos/intastellar-new-planet.svg";

/** JSON-LD publisher for inta.dev site graph and doc articles (Intastellar Solutions International). */
const INTASTELLAR_PUBLISHER_ORG = {
  "@type": "Organization",
  name: "Intastellar Solutions International",
  url: "https://www.intastellarsolutions.com/",
} as const;

/**
 * Site-wide JSON-LD: all stable `@id` values live on inta.dev so crawlers resolve the graph here.
 * Intastellar Solutions is the parent company; inta.dev is an organizational unit (portal);
 * Intastellar Consents is a software product of the company.
 */
export function buildGlobalSeoJsonLdMeta(): MetaDescriptor[] {
  const origin = siteOrigin();
  const companyId = `${origin}/#intastellar-solutions`;
  const portalOrgId = `${origin}/#inta-dev-portal`;
  const websiteId = `${origin}/#website`;
  const consentsSoftwareId = `${origin}/#software-intastellar-consents`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": companyId,
        name: "Intastellar Solutions",
        url: "https://www.intastellarsolutions.com/",
        logo: INTASTELLAR_ORG_LOGO,
        sameAs: ["https://www.intastellarsolutions.com/"],
        subOrganization: { "@id": portalOrgId },
      },
      {
        "@type": "Organization",
        "@id": portalOrgId,
        name: "inta.dev",
        url: `${origin}/`,
        parentOrganization: { "@id": companyId },
        description:
          "Developer documentation, API keys, and integration guides — the Intastellar Solutions developer portal.",
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_NAME,
        url: `${origin}/`,
        publisher: { ...INTASTELLAR_PUBLISHER_ORG },
      },
      {
        "@type": "SoftwareApplication",
        "@id": consentsSoftwareId,
        name: "Intastellar Consents",
        url: absoluteUrl("/docs/cookie-banner"),
        applicationCategory: "Consent Management Platform",
        provider: {
          "@type": "Organization",
          "@id": companyId,
          name: "Intastellar Solutions",
        },
      },
    ],
  };

  return [{ "script:ld+json": graph }];
}

type MetaMatch =
  | { id?: string; data?: unknown; loaderData?: unknown }
  | undefined;

function rootLoaderPayload(m: NonNullable<MetaMatch>): unknown {
  return m.loaderData ?? m.data;
}

/** Locale for `<meta>` from root loader data or URL prefix (e.g. `/de/docs`). */
export function resolveMetaLocale(
  matches: readonly MetaMatch[],
  pathname: string,
): Locale {
  for (const m of matches) {
    if (!m || m.id !== "root") continue;
    const payload = rootLoaderPayload(m);
    if (payload == null || typeof payload !== "object") continue;
    const loc = (payload as { locale?: string }).locale;
    if (isLocale(loc)) return loc;
  }
  return getLocaleFromPathname(pathname);
}

export function buildDocPageMeta(opts: {
  title: string;
  description?: string;
  pathname: string;
  /** ISO 8601 */
  modifiedTime?: string;
  /** Absolute image URL for Open Graph / Twitter */
  ogImage?: string;
  locale?: Locale;
}): MetaDescriptor[] {
  const {
    title,
    description,
    pathname,
    modifiedTime,
    ogImage,
    locale = DEFAULT_LOCALE,
  } = opts;
  const pageTitle = `${title} · ${SITE_NAME}`;
  const url = absoluteUrl(pathname);
  const desc =
    description ??
    interpolate(translatePath(locale, "docs.docPageFallbackDescription"), {
      title,
    });

  const twitterCard = ogImage ? "summary_large_image" : "summary";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: desc,
    url,
    ...(modifiedTime ? { dateModified: modifiedTime } : {}),
    ...(ogImage ? { image: ogImage } : {}),
    author: {
      "@type": "Organization",
      name: "Intastellar Solutions",
    },
    publisher: { ...INTASTELLAR_PUBLISHER_ORG },
  };

  return [
    { title: pageTitle },
    { name: "description", content: desc },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: desc },
    { property: "og:url", content: url },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: SITE_NAME },
    ...(ogImage
      ? [
          { property: "og:image", content: ogImage },
          { name: "twitter:image", content: ogImage },
        ]
      : []),
    { name: "twitter:card", content: twitterCard },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: desc },
    { "script:ld+json": jsonLd },
  ];
}

export function buildDocsHubMeta(
  pathname: string,
  locale: Locale = DEFAULT_LOCALE,
  opts?: { description?: string; ogImage?: string },
): MetaDescriptor[] {
  const title = `${translatePath(locale, "docs.hubMetaTitleCore")} · ${SITE_NAME}`;
  const desc =
    opts?.description ??
    translatePath(locale, "docs.hubMetaDescription");
  const url = absoluteUrl(pathname);
  const ogImage = opts?.ogImage;
  const twitterCard = ogImage ? "summary_large_image" : "summary";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: desc,
    url,
    ...(ogImage ? { image: ogImage } : {}),
  };

  return [
    { title },
    { name: "description", content: desc },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: title },
    { property: "og:description", content: desc },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    ...(ogImage
      ? [
          { property: "og:image", content: ogImage },
          { name: "twitter:image", content: ogImage },
        ]
      : []),
    { name: "twitter:card", content: twitterCard },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: desc },
    { "script:ld+json": jsonLd },
  ];
}

export function buildHomePageMeta(
  pathname: string,
  locale: Locale = DEFAULT_LOCALE,
): MetaDescriptor[] {
  const title = translatePath(locale, "meta.homeTitle");
  const desc = translatePath(locale, "meta.homeDescription");
  const url = absoluteUrl(pathname);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: title,
    description: desc,
    url,
    publisher: { ...INTASTELLAR_PUBLISHER_ORG },
  };

  return [
    { title },
    { name: "description", content: desc },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: title },
    { property: "og:description", content: desc },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: desc },
    { "script:ld+json": jsonLd },
  ];
}
