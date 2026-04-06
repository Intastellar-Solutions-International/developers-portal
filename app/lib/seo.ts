import type { MetaDescriptor } from "react-router";

import { DEFAULT_LOCALE, isLocale, type Locale } from "~/lib/i18n/locale";
import { getLocaleFromPathname } from "~/lib/i18n/localized-path";
import {
  interpolate,
  translatePath,
} from "~/lib/i18n/messages";
import { absoluteUrl } from "~/lib/site";

const SITE_NAME = "inta.dev";

type MetaMatch = { id?: string; data?: unknown } | undefined;

/** Locale for `<meta>` from root loader data or URL prefix (e.g. `/de/docs`). */
export function resolveMetaLocale(
  matches: readonly MetaMatch[],
  pathname: string,
): Locale {
  for (const m of matches) {
    if (!m || m.id !== "root" || m.data == null || typeof m.data !== "object") {
      continue;
    }
    const loc = (m.data as { locale?: string }).locale;
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
    publisher: {
      "@type": "Organization",
      name: "Intastellar Solutions",
    },
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
