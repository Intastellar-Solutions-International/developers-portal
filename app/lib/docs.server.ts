import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { DEFAULT_LOCALE, type Locale } from "~/lib/i18n/locale";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { translatePath } from "~/lib/i18n/messages";
import {
  docHref,
  getDefaultVersionSlug,
  parseDocsProductPath,
  unlocalizedDocPath,
} from "./docs-versions";
import { bundleDocMdx } from "./mdx.server";
import { absoluteUrl } from "./site";

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");

/** `content/docs/{locale}` — not product slugs. */
const LOCALE_ROOT_DIRS = new Set<string>(["de", "da", "fr", "nl", "pt-br"]);

export type RelatedLink = { title: string; href: string };

export type DocFrontmatter = {
  title: string;
  description?: string;
  sidebar_label?: string;
  order?: number;
  draft?: boolean;
  /** String or YAML-parsed Date; overrides file mtime when valid */
  lastUpdated?: string | Date;
  related?: RelatedLink[];
  /** Absolute URL or site path (e.g. /og/cookie-banner.png) for Open Graph */
  og_image?: string;
  /** Order on /docs hub (lower first; default 100) */
  hub_order?: number;
  /** Short hub card line; falls back to description */
  hub_tagline?: string;
};

export type DocLoaderData = {
  title: string;
  description?: string;
  code: string;
  /** ISO 8601 */
  lastUpdated: string;
  lastUpdatedSource: "frontmatter" | "file";
  related: RelatedLink[];
  /** Absolute URL for og:image when set in frontmatter */
  ogImage?: string;
};

export type SidebarItem = {
  href: string;
  label: string;
  order: number;
};

export type SidebarSection = {
  heading: string;
  items: SidebarItem[];
};

/** Flat order of doc pages as shown in the sidebar (for prev/next). */
export type DocsNavLink = { href: string; label: string };

const SIDEBAR_SECTION_ORDER = [
  "overview",
  "accounts",
  "javascript",
  "wordpress",
  "integrations",
  "other",
] as const;

type SidebarSectionId = (typeof SIDEBAR_SECTION_ORDER)[number];

const SIDEBAR_SECTION_MSG: Record<SidebarSectionId, string> = {
  overview: "docs.sidebarOverview",
  accounts: "docs.sidebarAccounts",
  javascript: "docs.sidebarJavascript",
  wordpress: "docs.sidebarWordpress",
  integrations: "docs.sidebarIntegrations",
  other: "docs.sidebarMore",
};

function sidebarSectionHeading(id: SidebarSectionId, locale: Locale): string {
  return translatePath(locale, SIDEBAR_SECTION_MSG[id]);
}

function sidebarSectionId(relFromProduct: string): SidebarSectionId {
  const n = relFromProduct.split(path.sep).join("/");
  if (n === "index.mdx") return "overview";
  if (
    n === "quickstart.mdx" ||
    n === "how-it-works.mdx" ||
    n === "core-concepts.mdx" ||
    n === "debugging.mdx"
  ) {
    return "overview";
  }
  if (n.startsWith("web/")) return "accounts";
  if (n.startsWith("javascript/")) return "javascript";
  if (n.startsWith("wordpress/")) return "wordpress";
  if (
    n === "google-tag-manager.mdx" ||
    n === "google-analytics-4.mdx" ||
    n === "google-consent-mode.mdx" ||
    n === "meta-pixel.mdx" ||
    n === "hubspot.mdx" ||
    n === "microsoft-clarity-and-uet.mdx" ||
    n === "matomo.mdx" ||
    n === "optimizely.mdx" ||
    n === "vwo.mdx" ||
    n === "segment.mdx" ||
    n === "pinterest.mdx" ||
    n === "shopify.mdx" ||
    n === "integrations-overview.mdx"
  ) {
    return "integrations";
  }
  if (!n.includes("/")) return "other";
  return "other";
}

function sortSidebarItems(items: SidebarItem[]) {
  return [...items].sort((a, b) =>
    a.order !== b.order ? a.order - b.order : a.href.localeCompare(b.href, "en"),
  );
}

function isValidProductSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug);
}

function isDocsProductDirName(name: string): boolean {
  return (
    !name.startsWith("_") &&
    !LOCALE_ROOT_DIRS.has(name) &&
    isValidProductSlug(name)
  );
}

function englishProductRoot(product: string): string {
  return path.join(DOCS_ROOT, product);
}

function coerceLastUpdated(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function resolveLastUpdated(
  frontmatter: DocFrontmatter,
  fileMtime: Date,
): { lastUpdated: string; lastUpdatedSource: "frontmatter" | "file" } {
  const fromFm = coerceLastUpdated(frontmatter.lastUpdated);
  if (fromFm) {
    return {
      lastUpdated: fromFm.toISOString(),
      lastUpdatedSource: "frontmatter",
    };
  }
  return {
    lastUpdated: fileMtime.toISOString(),
    lastUpdatedSource: "file",
  };
}

function coerceRelatedLinks(raw: unknown): RelatedLink[] {
  if (!Array.isArray(raw)) return [];
  const out: RelatedLink[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const href = typeof o.href === "string" ? o.href.trim() : "";
    if (!title || !href) continue;
    out.push({ title, href });
  }
  return out;
}

function resolveOgImageFromFrontmatter(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  const pathPart = t.startsWith("/") ? t : `/${t}`;
  return absoluteUrl(pathPart);
}

/** Version slug to use for sidebar links for the current request path. */
export function resolveSidebarVersion(
  product: string,
  pathname: string,
): string {
  return parseDocsProductPath(pathname, product).version;
}

export type BreadcrumbItem = { label: string; href?: string };

export async function getDocBreadcrumbs(
  product: string,
  version: string,
  pathname: string,
  docTitle: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<BreadcrumbItem[]> {
  const products = await listProducts(locale);
  const p = products.find((x) => x.slug === product);
  const productTitle = p?.title ?? product;
  const sections = await getSidebar(product, version, locale);
  let sectionLabel: string | undefined;
  for (const sec of sections) {
    if (sec.items.some((i) => i.href === pathname)) {
      sectionLabel = sec.heading;
      break;
    }
  }
  const out: BreadcrumbItem[] = [
    {
      label: translatePath(locale, "docs.breadcrumbDocumentation"),
      href: withLocalePrefix("/docs", locale),
    },
    { label: productTitle, href: docHref(locale, product, version) },
  ];
  if (sectionLabel) {
    out.push({ label: sectionLabel });
  }
  out.push({ label: docTitle });
  return out;
}

async function resolveDocFile(
  product: string,
  docPath: string | undefined,
  locale: Locale,
): Promise<string | null> {
  if (!isValidProductSlug(product)) return null;

  const tryResolveFrom = async (baseDir: string): Promise<string | null> => {
    const realBase = await fs.realpath(baseDir).catch(() => null);
    if (!realBase) return null;

    const candidates: string[] = [];
    if (!docPath || docPath === "") {
      candidates.push(path.join(realBase, "index.mdx"));
    } else {
      const safe = docPath.replace(/^\/+|\/+$/g, "").replace(/\.\./g, "");
      if (!safe) return null;
      candidates.push(path.join(realBase, `${safe}.mdx`));
      candidates.push(path.join(realBase, safe, "index.mdx"));
    }

    for (const file of candidates) {
      const realFile = await fs.realpath(file).catch(() => null);
      if (!realFile) continue;
      if (!realFile.startsWith(realBase + path.sep) && realFile !== realBase) {
        continue;
      }
      try {
        const st = await fs.stat(realFile);
        if (st.isFile()) return realFile;
      } catch {
        /* missing */
      }
    }
    return null;
  };

  if (locale !== "en") {
    const localized = await tryResolveFrom(path.join(DOCS_ROOT, locale, product));
    if (localized) return localized;
  }

  return tryResolveFrom(englishProductRoot(product));
}

export async function loadDoc(
  product: string,
  splat: string | undefined,
  locale: Locale = DEFAULT_LOCALE,
): Promise<DocLoaderData | null> {
  const filePath = await resolveDocFile(product, splat, locale);
  if (!filePath) return null;

  const [bundle, stat] = await Promise.all([
    bundleDocMdx(filePath),
    fs.stat(filePath),
  ]);

  const fm = bundle.frontmatter as DocFrontmatter;
  if (!fm?.title) {
    throw new Error(`Missing required "title" in frontmatter: ${filePath}`);
  }
  if (fm.draft === true && process.env.NODE_ENV === "production") {
    return null;
  }

  const { lastUpdated, lastUpdatedSource } = resolveLastUpdated(fm, stat.mtime);
  const related = coerceRelatedLinks(fm.related);
  const ogImage = resolveOgImageFromFrontmatter(fm.og_image);

  return {
    title: fm.title,
    description: fm.description,
    code: bundle.code,
    lastUpdated,
    lastUpdatedSource,
    related,
    ...(ogImage ? { ogImage } : {}),
  };
}

async function readFrontmatterTitle(
  filePath: string,
): Promise<{ title: string; order: number }> {
  const raw = await fs.readFile(filePath, "utf8");
  const { data } = matter(raw);
  const fm = data as Partial<DocFrontmatter>;
  const fallback = path.basename(filePath, ".mdx");
  return {
    title: fm.title ?? fm.sidebar_label ?? fallback,
    order: typeof fm.order === "number" ? fm.order : 999,
  };
}

async function readFrontmatterTitleForLocale(
  product: string,
  relFromProduct: string,
  locale: Locale,
): Promise<{ title: string; order: number }> {
  const enPath = path.join(DOCS_ROOT, product, relFromProduct);
  if (locale === "en") {
    return readFrontmatterTitle(enPath);
  }
  const locPath = path.join(DOCS_ROOT, locale, product, relFromProduct);
  try {
    await fs.access(locPath);
    return readFrontmatterTitle(locPath);
  } catch {
    return readFrontmatterTitle(enPath);
  }
}

function filePathToHref(
  product: string,
  filePath: string,
  version: string,
  locale: Locale,
): string {
  const rel = path.relative(englishProductRoot(product), filePath);
  const withoutExt = rel.replace(/\/index\.mdx$/i, "").replace(/\.mdx$/i, "");
  if (!withoutExt || withoutExt === "index")
    return docHref(locale, product, version);
  const urlPath = withoutExt.split(path.sep).join("/");
  return docHref(locale, product, version, urlPath);
}

export async function getSidebar(
  product: string,
  version: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<SidebarSection[]> {
  if (!isValidProductSlug(product)) return [];

  const base = englishProductRoot(product);
  type Collected = SidebarItem & { rel: string };
  const collected: Collected[] = [];

  async function walk(dir: string) {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of list) {
      if (ent.name.startsWith("_")) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (ent.isFile() && ent.name.endsWith(".mdx")) {
        const rel = path.relative(base, full);
        const { title, order } = await readFrontmatterTitleForLocale(
          product,
          rel,
          locale,
        );
        collected.push({
          href: filePathToHref(product, full, version, locale),
          label: title,
          order,
          rel,
        });
      }
    }
  }

  await walk(base);

  const buckets = new Map<SidebarSectionId, Collected[]>();
  for (const id of SIDEBAR_SECTION_ORDER) {
    buckets.set(id, []);
  }
  for (const row of collected) {
    const id = sidebarSectionId(row.rel);
    buckets.get(id)!.push(row);
  }

  const sections: SidebarSection[] = [];
  for (const id of SIDEBAR_SECTION_ORDER) {
    const raw = buckets.get(id) ?? [];
    if (raw.length === 0) continue;
    const items: SidebarItem[] = sortSidebarItems(
      raw.map(({ href, label, order }) => ({ href, label, order })),
    );
    sections.push({
      heading: sidebarSectionHeading(id, locale),
      items,
    });
  }

  return sections;
}

export async function getDocsNavFlat(
  product: string,
  version: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<DocsNavLink[]> {
  const sections = await getSidebar(product, version, locale);
  const out: DocsNavLink[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      out.push({ href: item.href, label: item.label });
    }
  }
  return out;
}

export function getAdjacentDocs(
  ordered: DocsNavLink[],
  currentPathname: string,
): { prev?: DocsNavLink; next?: DocsNavLink } {
  const path = currentPathname.split(/[?#]/)[0] ?? currentPathname;
  const idx = ordered.findIndex((x) => x.href === path);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? ordered[idx - 1] : undefined,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : undefined,
  };
}

export type ProductSummary = {
  slug: string;
  title: string;
  description?: string;
  /** From frontmatter `hub_tagline`, else description */
  cardSummary?: string;
  hubOrder: number;
};

async function walkDocsTree(
  dir: string,
  visit: (filePath: string) => Promise<void>,
) {
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const e of list) {
    if (e.name.startsWith("_")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walkDocsTree(full, visit);
    else await visit(full);
  }
}

function mdxFileToPathname(product: string, filePath: string): string {
  const rel = path.relative(englishProductRoot(product), filePath);
  const n = rel.split(path.sep).join("/");
  const withoutExt = n.replace(/\/index\.mdx$/i, "").replace(/\.mdx$/i, "");
  const version = getDefaultVersionSlug(product);
  if (!withoutExt || withoutExt === "index") {
    return unlocalizedDocPath(product, version);
  }
  return unlocalizedDocPath(product, version, withoutExt);
}

export type DocSitemapEntry = { pathname: string; lastmod: string };

/** Public doc URLs (default version only) with `lastmod` from frontmatter or file mtime. */
export async function getDocSitemapEntries(): Promise<DocSitemapEntry[]> {
  const isProd = process.env.NODE_ENV === "production";
  const entries = await fs.readdir(DOCS_ROOT, { withFileTypes: true }).catch(
    () => [],
  );
  /** One pathname per doc; if several files map to the same path, keep the newer `lastmod`. */
  const byPath = new Map<string, string>();

  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name.startsWith("_")) continue;
    const product = ent.name;
    if (!isDocsProductDirName(product)) continue;
    const indexPath = path.join(DOCS_ROOT, product, "index.mdx");
    try {
      const raw = await fs.readFile(indexPath, "utf8");
      const { data } = matter(raw);
      const fm = data as Partial<DocFrontmatter>;
      if (isProd && fm.draft === true) continue;
    } catch {
      continue;
    }

    await walkDocsTree(path.join(DOCS_ROOT, product), async (filePath) => {
      if (!filePath.endsWith(".mdx")) return;
      const [raw, stat] = await Promise.all([
        fs.readFile(filePath, "utf8"),
        fs.stat(filePath),
      ]);
      const { data } = matter(raw);
      const fm = data as Partial<DocFrontmatter>;
      if (isProd && fm.draft === true) return;
      const pathname = mdxFileToPathname(product, filePath);
      const { lastUpdated } = resolveLastUpdated(
        fm as DocFrontmatter,
        stat.mtime,
      );
      const prev = byPath.get(pathname);
      if (prev == null) {
        byPath.set(pathname, lastUpdated);
      } else {
        const pt = Date.parse(prev);
        const nt = Date.parse(lastUpdated);
        if (Number.isFinite(nt) && (!Number.isFinite(pt) || nt >= pt)) {
          byPath.set(pathname, lastUpdated);
        }
      }
    });
  }

  return [...byPath.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(([pathname, lastmod]) => ({ pathname, lastmod }));
}

export async function listProducts(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ProductSummary[]> {
  const entries = await fs.readdir(DOCS_ROOT, { withFileTypes: true }).catch(
    () => [],
  );
  const dirs = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith("_") && isDocsProductDirName(e.name),
  );

  const out: ProductSummary[] = [];
  for (const d of dirs) {
    const indexLocalized =
      locale !== "en"
        ? path.join(DOCS_ROOT, locale, d.name, "index.mdx")
        : null;
    const indexEn = path.join(DOCS_ROOT, d.name, "index.mdx");
    let indexPath = indexEn;
    if (indexLocalized) {
      try {
        await fs.access(indexLocalized);
        indexPath = indexLocalized;
      } catch {
        indexPath = indexEn;
      }
    }
    try {
      const raw = await fs.readFile(indexPath, "utf8");
      const { data } = matter(raw);
      const fm = data as Partial<DocFrontmatter>;
      if (fm.draft === true && process.env.NODE_ENV === "production") continue;
      const hubOrder =
        typeof fm.hub_order === "number" && Number.isFinite(fm.hub_order)
          ? fm.hub_order
          : 100;
      const tagline =
        typeof fm.hub_tagline === "string" ? fm.hub_tagline.trim() : "";
      out.push({
        slug: d.name,
        title: fm.title ?? d.name,
        description: fm.description,
        cardSummary: tagline || fm.description,
        hubOrder,
      });
    } catch {
      /* skip products without index */
    }
  }
  out.sort((a, b) =>
    a.hubOrder !== b.hubOrder
      ? a.hubOrder - b.hubOrder
      : a.title.localeCompare(b.title, "en"),
  );
  return out;
}
