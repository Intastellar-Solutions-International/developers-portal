/**
 * Opening the docs search overlay from arbitrary route chunks.
 *
 * React context can resolve to a different instance across lazy-loaded chunks,
 * so we use a document event listened to in `root.tsx` (same place as overlay state).
 */

export const OPEN_SEARCH_EVENT = "inta:open-search";

export function requestOpenSearch() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}
