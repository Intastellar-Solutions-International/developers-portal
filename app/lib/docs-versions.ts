import { type Locale } from "~/lib/i18n/locale";
import { stripLocalePrefix, withLocalePrefix } from "~/lib/i18n/localized-path";

export type DocsVersion = { slug: string; label: string };

/** Per-product doc versions (URL segment after /docs/:product/). */
export const DOCS_PRODUCT_VERSIONS: Record<string, DocsVersion[]> = {
  "cookie-banner": [{ slug: "v1", label: "v1" }],
  "accounts-sign-in": [{ slug: "v1", label: "v1" }],
};

export function getVersionsForProduct(slug: string): DocsVersion[] {
  return DOCS_PRODUCT_VERSIONS[slug] ?? [{ slug: "v1", label: "v1" }];
}

export function getDefaultVersionSlug(product: string): string {
  return getVersionsForProduct(product)[0]!.slug;
}

export function isDocsVersionSlug(product: string, segment: string): boolean {
  return getVersionsForProduct(product).some((v) => v.slug === segment);
}

export function normalizeDocsVersionSlug(
  product: string,
  segment: string,
): string {
  if (segment === "latest") return getDefaultVersionSlug(product);
  return segment;
}

/** `/docs/:product/:version/...` without locale prefix (English canonical shape). */
export function unlocalizedDocPath(
  product: string,
  version: string,
  docPath?: string,
): string {
  const v = normalizeDocsVersionSlug(product, version);
  const tail = docPath?.replace(/^\/+|\/+$/g, "") ?? "";
  if (!tail) return `/docs/${product}/${v}`;
  return `/docs/${product}/${v}/${tail}`;
}

/**
 * Canonical doc URL for a locale (English unprefixed; other locales as `/{locale}/docs/...`).
 */
export function docHref(
  locale: Locale,
  product: string,
  version: string,
  docPath?: string,
): string {
  return withLocalePrefix(unlocalizedDocPath(product, version, docPath), locale);
}

export type ParsedDocSplat =
  | { redirect: string }
  | { version: string; docPath: string | undefined };

export function parseDocSplat(
  product: string,
  splat: string,
  locale: Locale,
): ParsedDocSplat {
  const trimmed = splat.replace(/^\/+|\/+$/g, "");
  const segments = trimmed ? trimmed.split("/").filter(Boolean) : [];
  const defaultV = getDefaultVersionSlug(product);

  if (segments.length === 0) {
    return { redirect: docHref(locale, product, defaultV) };
  }

  const first = segments[0]!;
  if (!isDocsVersionSlug(product, first) && first !== "latest") {
    return {
      redirect: docHref(locale, product, defaultV, segments.join("/")),
    };
  }

  const version = normalizeDocsVersionSlug(product, first);
  const docRest = segments.slice(1).join("/");
  return { version, docPath: docRest || undefined };
}

/** First segment after `/docs/` (product slug), from any locale-prefixed pathname. */
export function docsProductSlugFromPathname(pathname: string): string {
  const bare = stripLocalePrefix(pathname);
  const m = bare.match(/^\/docs\/([^/]+)/);
  return m?.[1] ?? "";
}

export function parseDocsProductPath(
  pathname: string,
  product: string,
): { version: string; docTail: string } {
  const bare = stripLocalePrefix(pathname);
  const prefix = `/docs/${product}/`;
  const defaultV = getDefaultVersionSlug(product);
  if (!bare.startsWith(prefix)) {
    return { version: defaultV, docTail: "" };
  }
  const rest = bare.slice(prefix.length).replace(/\/$/, "");
  const segments = rest ? rest.split("/").filter(Boolean) : [];
  if (segments.length === 0) return { version: defaultV, docTail: "" };
  const first = segments[0]!;
  if (isDocsVersionSlug(product, first) || first === "latest") {
    return {
      version: normalizeDocsVersionSlug(product, first),
      docTail: segments.slice(1).join("/"),
    };
  }
  return { version: defaultV, docTail: segments.join("/") };
}
