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

  // Word-boundary aware: token must not be immediately preceded/followed by a
  // letter or digit. This prevents "rage" from matching inside "storage".
  function wordRe(token: string): RegExp {
    const esc = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`, "g");
  }

  function countMatches(hay: string, re: RegExp): number {
    re.lastIndex = 0;
    return (hay.match(re) ?? []).length;
  }

  // Phrase pattern: tokens joined by any whitespace, underscore, or hyphen.
  // "rage click" matches both "rage_click" and "rage click" in code/prose.
  const phraseRe =
    tokens.length > 1
      ? new RegExp(
          `(?<![a-z0-9])${tokens
            .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join("[\\s_-]+")}(?![a-z0-9])`,
        )
      : null;

  const scored = docs
    .map((doc) => {
      const hayTitle = doc.title.toLowerCase();
      const hayDesc = (doc.description ?? "").toLowerCase();
      const hayText = doc.text.toLowerCase();
      const hayProduct = doc.product.toLowerCase();
      const hayHref = doc.href.toLowerCase();
      let score = 0;

      // Full-phrase match bonus — highest priority signal
      if (phraseRe) {
        if (phraseRe.test(hayTitle)) score += 60;
        if (phraseRe.test(hayDesc)) score += 30;
        if (phraseRe.test(hayText)) score += 20;
      }

      for (const t of tokens) {
        const re = wordRe(t);

        // Title: strongest per-token signal
        if (countMatches(hayTitle, re) > 0) score += 20;

        // Description: moderate signal
        if (countMatches(hayDesc, re) > 0) score += 8;

        // Product slug: exact product relevance
        if (hayProduct.includes(t)) score += 10;

        // Href: weak contextual signal
        if (hayHref.includes(t)) score += 4;

        // Text: frequency-weighted, capped to avoid runaway scores
        score += Math.min(countMatches(hayText, re), 8) * 3;
      }

      return { doc, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.doc);

  return scored;
}
