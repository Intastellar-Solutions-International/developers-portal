import type { SearchDocument } from "~/lib/search-index.server";

/** Lightweight full-text search over indexed docs (no extra dependencies). */
export function searchDocuments(
  query: string,
  docs: SearchDocument[],
  limit = 50,
): SearchDocument[] {
  const q = query.trim().toLowerCase();
  if (!q) return docs.slice(0, 12);

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return docs.slice(0, 12);

  const scored = docs
    .map((doc) => {
      const hayTitle = doc.title.toLowerCase();
      const hayDesc = (doc.description ?? "").toLowerCase();
      const hayText = doc.text.toLowerCase();
      const hayProduct = doc.product.toLowerCase();
      const hayHref = doc.href.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (hayTitle.includes(t)) score += 12;
        if (hayDesc.includes(t)) score += 6;
        if (hayProduct.includes(t)) score += 8;
        if (hayHref.includes(t)) score += 4;
        if (hayText.includes(t)) score += 1;
      }
      return { doc, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.doc);

  return scored;
}
