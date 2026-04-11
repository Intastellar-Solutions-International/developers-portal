import { useLayoutEffect, useEffect, useRef } from "react";
import type { FetcherWithComponents } from "react-router";

import type { BookmarkActionData } from "~/components/doc-bookmark-types";
import { pushAppToast } from "~/lib/app-toast";
import { useI18n } from "~/providers/i18n-provider";

/**
 * After bookmark save/remove via the shared doc `bookmarkFetcher`, shows success or error toasts.
 */
export function useDocBookmarkSaveToast(
  fetcher: FetcherWithComponents<BookmarkActionData>,
  opts: {
    enabled: boolean;
    docSavedToProfile: boolean;
    canonicalPath: string;
  },
): void {
  const { t } = useI18n();
  const prevSaved = useRef<boolean | undefined>(undefined);
  const awaitingResult = useRef(false);
  const lastFlipToastKey = useRef("");
  const lastErrorToastKey = useRef("");

  useLayoutEffect(() => {
    prevSaved.current = opts.docSavedToProfile;
    awaitingResult.current = false;
    lastFlipToastKey.current = "";
    lastErrorToastKey.current = "";
  }, [opts.canonicalPath]);

  useEffect(() => {
    if (!opts.enabled) return;
    if (fetcher.state !== "idle") {
      awaitingResult.current = true;
      lastFlipToastKey.current = "";
      lastErrorToastKey.current = "";
    }
  }, [opts.enabled, fetcher.state]);

  useEffect(() => {
    if (!opts.enabled) return;
    if (fetcher.state !== "idle" || !awaitingResult.current) return;

    const data = fetcher.data;
    if (data != null && !data.ok) {
      const errMsg =
        typeof data.error === "string" ? data.error : String(data.error ?? "");
      const errKey = `${opts.canonicalPath}:err:${errMsg}`;
      if (lastErrorToastKey.current !== errKey) {
        lastErrorToastKey.current = errKey;
        pushAppToast("error", errMsg || "Error");
      }
      awaitingResult.current = false;
      return;
    }

    if (data == null || !data.ok) {
      awaitingResult.current = false;
      return;
    }

    const before = prevSaved.current;
    const after = opts.docSavedToProfile;

    if (before === false && after === true) {
      const flipKey = `${opts.canonicalPath}:false->true`;
      if (lastFlipToastKey.current === flipKey) {
        prevSaved.current = after;
        awaitingResult.current = false;
        return;
      }
      lastFlipToastKey.current = flipKey;
      pushAppToast("success", t("docs.bookmarkToastSaved"));
      prevSaved.current = after;
      awaitingResult.current = false;
      return;
    }

    if (before === true && after === false) {
      const flipKey = `${opts.canonicalPath}:true->false`;
      if (lastFlipToastKey.current === flipKey) {
        prevSaved.current = after;
        awaitingResult.current = false;
        return;
      }
      lastFlipToastKey.current = flipKey;
      pushAppToast("success", t("docs.bookmarkToastRemoved"));
      prevSaved.current = after;
      awaitingResult.current = false;
    }
  }, [
    opts.enabled,
    opts.docSavedToProfile,
    opts.canonicalPath,
    fetcher.state,
    fetcher.data,
    t,
  ]);
}
