import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { bundleDocMdx } from "./mdx.server";

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");

export type DocFrontmatter = {
  title: string;
  description?: string;
  sidebar_label?: string;
  order?: number;
  draft?: boolean;
  /** String or YAML-parsed Date; overrides file mtime when valid */
  lastUpdated?: string | Date;
};

export type DocLoaderData = {
  title: string;
  description?: string;
  code: string;
  /** ISO 8601 */
  lastUpdated: string;
  lastUpdatedSource: "frontmatter" | "file";
};

export type SidebarItem = {
  href: string;
  label: string;
  order: number;
};

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

  return {
    title: fm.title,
    description: fm.description,
    code: bundle.code,
    lastUpdated,
    lastUpdatedSource,
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

function filePathToHref(product: string, filePath: string): string {
  const rel = path.relative(path.join(DOCS_ROOT, product), filePath);
  const withoutExt = rel.replace(/\/index\.mdx$/i, "").replace(/\.mdx$/i, "");
  if (!withoutExt || withoutExt === "index") return `/docs/${product}`;
  const urlPath = withoutExt.split(path.sep).join("/");
  return `/docs/${product}/${urlPath}`;
}

export async function getSidebar(product: string): Promise<SidebarItem[]> {
  if (!isValidProductSlug(product)) return [];

  const base = path.join(DOCS_ROOT, product);
  const entries = await fs.readdir(base, { withFileTypes: true }).catch(() => []);
  const items: SidebarItem[] = [];

  async function walk(dir: string) {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of list) {
      if (ent.name.startsWith("_")) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (ent.isFile() && ent.name.endsWith(".mdx")) {
        const { title, order } = await readFrontmatterTitle(full);
        items.push({
          href: filePathToHref(product, full),
          label: title,
          order,
        });
      }
    }
  }

  await walk(base);
  items.sort((a, b) =>
    a.order !== b.order
      ? a.order - b.order
      : a.href.localeCompare(b.href, "en"),
  );
  return items;
}

export type ProductSummary = {
  slug: string;
  title: string;
  description?: string;
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
      out.push({
        slug: d.name,
        title: fm.title ?? d.name,
        description: fm.description,
      });
    } catch {
      /* skip products without index */
    }
  }
  out.sort((a, b) => a.title.localeCompare(b.title, "en"));
  return out;
}
