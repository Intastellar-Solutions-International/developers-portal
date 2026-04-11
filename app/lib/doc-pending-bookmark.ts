const STORAGE_KEY = "inta_doc_pending_bookmark_v1";

/** Stale entries are ignored so a random profile visit does not jump away. */
export const DOC_PENDING_BOOKMARK_MAX_AGE_MS = 15 * 60 * 1000;

export type DocPendingBookmarkPayload = {
  /** Doc URL to return to after OAuth / profile (pathname + search + hash). */
  returnPath: string;
  canonicalPath: string;
  title: string;
  /** Locale-prefixed POST target for `saveDoc` (same as doc loader). */
  profileFormAction: string;
  setAt: number;
};

export function writeDocPendingBookmark(
  payload: Omit<DocPendingBookmarkPayload, "setAt">,
): void {
  try {
    const full: DocPendingBookmarkPayload = {
      ...payload,
      setAt: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch {
    /* private mode / quota */
  }
}

export function readDocPendingBookmark(): DocPendingBookmarkPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const rec = o as Record<string, unknown>;
    if (typeof rec.returnPath !== "string") return null;
    if (typeof rec.canonicalPath !== "string") return null;
    if (typeof rec.title !== "string") return null;
    if (typeof rec.profileFormAction !== "string") return null;
    const setAt =
      typeof rec.setAt === "number" && Number.isFinite(rec.setAt)
        ? rec.setAt
        : 0;
    if (Date.now() - setAt > DOC_PENDING_BOOKMARK_MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      returnPath: rec.returnPath,
      canonicalPath: rec.canonicalPath,
      title: rec.title,
      profileFormAction: rec.profileFormAction,
      setAt,
    };
  } catch {
    return null;
  }
}

export function clearDocPendingBookmark(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
