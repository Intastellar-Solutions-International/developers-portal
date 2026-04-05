import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { docHref, parseDocsProductPath } from "./docs-versions";
import { bundleDocMdx } from "./mdx.server";
import { absoluteUrl } from "./site";

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");

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

const SIDEBAR_SECTION_LABEL: Record<SidebarSectionId, string> = {
  overview: "Overview",
  accounts: "Sign in (Web)",
  javascript: "JavaScript",
  wordpress: "WordPress",
  integrations: "Integrations",
  other: "More",
};

function sidebarSectionId(relFromProduct: string): SidebarSectionId {
  const n = relFromProduct.split(path.sep).join("/");
  if (n === "index.mdx") return "overview";
  if (n.startsWith("web/")) return "accounts";
  if (n.startsWith("javascript/")) return "javascript";
  if (n.startsWith("wordpress/")) return "wordpress";
  if (n === "google-tag-manager.mdx" || n === "shopify.mdx") {
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
): Promise<BreadcrumbItem[]> {
  const products = await listProducts();
  const p = products.find((x) => x.slug === product);
  const productTitle = p?.title ?? product;
  const sections = await getSidebar(product, version);
  let sectionLabel: string | undefined;
  for (const sec of sections) {
    if (sec.items.some((i) => i.href === pathname)) {
      sectionLabel = sec.heading;
      break;
    }
  }
  const out: BreadcrumbItem[] = [
    { label: "Documentation", href: "/docs" },
    { label: productTitle, href: docHref(product, version) },
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
): Promise<string | null> {
  if (!isValidProductSlug(product)) return null;

  const base = path.join(DOCS_ROOT, product);
  const realBase = await fs.realpath(base).catch(() => null);
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
}

export async function loadDoc(
  product: string,
  splat: string | undefined,
): Promise<DocLoaderData | null> {
  const filePath = await resolveDocFile(product, splat);
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

function filePathToHref(
  product: string,
  filePath: string,
  version: string,
): string {
  const rel = path.relative(path.join(DOCS_ROOT, product), filePath);
  const withoutExt = rel.replace(/\/index\.mdx$/i, "").replace(/\.mdx$/i, "");
  if (!withoutExt || withoutExt === "index")
    return docHref(product, version);
  const urlPath = withoutExt.split(path.sep).join("/");
  return docHref(product, version, urlPath);
}

export async function getSidebar(
  product: string,
  version: string,
): Promise<SidebarSection[]> {
  if (!isValidProductSlug(product)) return [];

  const base = path.join(DOCS_ROOT, product);
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
        const { title, order } = await readFrontmatterTitle(full);
        const rel = path.relative(base, full);
        collected.push({
          href: filePathToHref(product, full, version),
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
      heading: SIDEBAR_SECTION_LABEL[id],
      items,
    });
  }

  return sections;
}

export async function getDocsNavFlat(
  product: string,
  version: string,
): Promise<DocsNavLink[]> {
  const sections = await getSidebar(product, version);
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

export async function listProducts(): Promise<ProductSummary[]> {
  const entries = await fs.readdir(DOCS_ROOT, { withFileTypes: true }).catch(
    () => [],
  );
  const dirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("_"));

  const out: ProductSummary[] = [];
  for (const d of dirs) {
    if (!isValidProductSlug(d.name)) continue;
    const indexPath = path.join(DOCS_ROOT, d.name, "index.mdx");
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
