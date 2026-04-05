import type { MetaDescriptor } from "react-router";

import { absoluteUrl } from "~/lib/site";

const SITE_NAME = "inta.dev";

export function buildDocPageMeta(opts: {
  title: string;
  description?: string;
  pathname: string;
  /** ISO 8601 */
  modifiedTime?: string;
  /** Absolute image URL for Open Graph / Twitter */
  ogImage?: string;
}): MetaDescriptor[] {
  const { title, description, pathname, modifiedTime, ogImage } = opts;
  const pageTitle = `${title} · ${SITE_NAME}`;
  const url = absoluteUrl(pathname);
  const desc =
    description ??
    `${title} — Intastellar developer documentation on ${SITE_NAME}.`;

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
  opts?: { description?: string; ogImage?: string },
): MetaDescriptor[] {
  const title = `Documentation · ${SITE_NAME}`;
  const desc =
    opts?.description ??
    "Documentation for Intastellar developer products: Intastellar Consents, accounts sign-in, and APIs.";
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

export function buildHomePageMeta(pathname: string): MetaDescriptor[] {
  const title = `inta.dev · Intastellar Developers`;
  const desc =
    "Documentation, API keys, and integration guides for Intastellar Consents and Intastellar Accounts on inta.dev.";
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
