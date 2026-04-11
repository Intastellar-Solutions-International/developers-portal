import { DOCS_PRODUCT_VERSIONS } from "~/lib/docs-versions";
import { stripLocalePrefix } from "~/lib/i18n/localized-path";

const MAX_PATH = 512;
const MAX_TITLE = 220;

/** One bookmarked documentation URL stored on `user_accounts`. */
export type SavedDocumentationBookmark = {
  path: string;
  title: string;
  savedAt: Date;
};

/**
 * Validates and normalizes a docs URL to a canonical unlocalized path
 * (`/docs/{product}/{version}/…`). Rejects unknown products and bad shapes.
 */
export function normalizeSavedDocumentationPath(raw: string): string | null {
  const input = raw.trim().slice(0, MAX_PATH);
  if (!input) return null;
  const withSlash = input.startsWith("/") ? input : `/${input}`;
  const bare = stripLocalePrefix(
    withSlash.split("?")[0]!.split("#")[0]!,
  ).replace(/\/+$/, "");
  const segs = bare.split("/").filter(Boolean);
  if (segs.length < 3 || segs[0] !== "docs") return null;
  const product = segs[1]!;
  const version = segs[2]!;
  if (!(product in DOCS_PRODUCT_VERSIONS)) return null;
  if (!/^v\d+$/i.test(version)) return null;
  const tail = segs.slice(3).join("/");
  return tail
    ? `/docs/${product}/${version}/${tail}`
    : `/docs/${product}/${version}`;
}

export function clampBookmarkTitle(raw: string): string {
  const t = raw.replace(/\s+/g, " ").trim().slice(0, MAX_TITLE);
  return t || "Documentation";
}
