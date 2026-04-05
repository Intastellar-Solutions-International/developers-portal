#!/usr/bin/env node
/**
 * Walks content/docs and writes public/search-index.json for the /search page.
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import matter from "gray-matter";

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");
const OUT = path.join(process.cwd(), "public", "search-index.json");

/** Keep in sync with app/lib/docs-versions.ts default version for each product. */
const SEARCH_INDEX_VERSION = "v1";

function filePathToHref(product, filePath) {
  const rel = path.relative(path.join(DOCS_ROOT, product), filePath);
  const n = rel.split(path.sep).join("/");
  const withoutExt = n.replace(/\/index\.mdx$/i, "").replace(/\.mdx$/i, "");
  if (!withoutExt || withoutExt === "index") {
    return `/docs/${product}/${SEARCH_INDEX_VERSION}`;
  }
  return `/docs/${product}/${SEARCH_INDEX_VERSION}/${withoutExt}`;
}

async function walk(dir, visit) {
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const e of list) {
    if (e.name.startsWith("_")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, visit);
    else await visit(full);
  }
}

const isProd = process.env.NODE_ENV === "production";

async function main() {
  let entries;
  try {
    entries = await fs.readdir(DOCS_ROOT, { withFileTypes: true });
  } catch {
    console.warn("search index: no content/docs, writing []");
    await fs.mkdir(path.dirname(OUT), { recursive: true });
    await fs.writeFile(OUT, "[]", "utf8");
    return;
  }

  const docs = [];

  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name.startsWith("_")) continue;
    const product = ent.name;
    await walk(path.join(DOCS_ROOT, product), async (filePath) => {
      if (!filePath.endsWith(".mdx")) return;
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);
      if (isProd && data.draft === true) return;
      const href = filePathToHref(product, filePath);
      const title = typeof data.title === "string" ? data.title : "Untitled";
      const description =
        typeof data.description === "string" ? data.description : "";
      const text = content
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/[#>*_`[\]()|-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000);
      docs.push({
        id: href,
        title,
        href,
        product,
        description,
        text: `${title} ${description} ${text}`,
      });
    });
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(docs), "utf8");
  console.log(`search index: ${docs.length} docs → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
