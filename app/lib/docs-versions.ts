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

/**
 * Parse /docs/:product/... for the version switcher (client-safe).
 * Legacy paths without a version segment treat docTail as the path after /product/.
 */
export function docHref(
  product: string,
  version: string,
  docPath?: string,
): string {
  const v = normalizeDocsVersionSlug(product, version);
  const tail = docPath?.replace(/^\/+|\/+$/g, "") ?? "";
  if (!tail) return `/docs/${product}/${v}`;
  return `/docs/${product}/${v}/${tail}`;
}

export type ParsedDocSplat =
  | { redirect: string }
  | { version: string; docPath: string | undefined };

export function parseDocSplat(product: string, splat: string): ParsedDocSplat {
  const trimmed = splat.replace(/^\/+|\/+$/g, "");
  const segments = trimmed ? trimmed.split("/").filter(Boolean) : [];
  const defaultV = getDefaultVersionSlug(product);

  if (segments.length === 0) {
    return { redirect: docHref(product, defaultV) };
  }

  const first = segments[0]!;
  if (!isDocsVersionSlug(product, first) && first !== "latest") {
    return { redirect: docHref(product, defaultV, segments.join("/")) };
  }

  const version = normalizeDocsVersionSlug(product, first);
  const docRest = segments.slice(1).join("/");
  return { version, docPath: docRest || undefined };
}

export function parseDocsProductPath(
  pathname: string,
  product: string,
): { version: string; docTail: string } {
  const prefix = `/docs/${product}/`;
  const defaultV = getDefaultVersionSlug(product);
  if (!pathname.startsWith(prefix)) {
    return { version: defaultV, docTail: "" };
  }
  const rest = pathname.slice(prefix.length).replace(/\/$/, "");
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
