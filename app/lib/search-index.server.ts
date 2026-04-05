import fs from "node:fs/promises";
import path from "node:path";

export type SearchDocument = {
  id: string;
  title: string;
  href: string;
  product: string;
  description: string;
  text: string;
};

const INDEX_PATH = path.join(process.cwd(), "public", "search-index.json");

export async function readSearchIndex(): Promise<SearchDocument[]> {
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf8");
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data as SearchDocument[];
  } catch {
    return [];
  }
}
